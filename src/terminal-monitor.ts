import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class TerminalMonitor {
	private watchers: Map<string, fs.FSWatcher> = new Map();
	private terminalLogPaths: Map<string, string> = new Map();

	constructor() {
		this.setupTerminalLogging();
	}

	private setupTerminalLogging() {
		// Monitor terminal creation to set up logging
		vscode.window.onDidOpenTerminal((terminal: vscode.Terminal) => {
			this.setupTerminalFileWatcher(terminal); // Fix: Call the correct method
		});
	}
	private async setupTerminalFileWatcher(terminal: vscode.Terminal) {
		// This is a more advanced approach that would require
		// setting up terminal session logging to files
		const logPath = this.getTerminalLogPath(terminal);

		if (fs.existsSync(logPath)) {
			const watcher = fs.watch(logPath, (eventType: string, filename: string | null) => {
				if (eventType === "change") {
					this.handleLogFileChange(logPath, terminal);
				}
			});

			this.watchers.set(terminal.name, watcher);
		}
	}

	private getTerminalLogPath(terminal: vscode.Terminal): string {
		// Implementation would depend on terminal configuration
		// This is a conceptual approach
		return path.join(
			process.env.TEMP || "/tmp",
			`terminal-${terminal.name}.log`
		);
	}

	private async handleLogFileChange(
		logPath: string,
		terminal: vscode.Terminal
	) {
		try {
			const content = fs.readFileSync(logPath, "utf8");
			const lines = content.split("\n");
			const lastLines = lines.slice(-10); // Get last 10 lines

			// Process the new content
			await this.processTerminalOutput(lastLines.join("\n"), terminal);
		} catch (error) {
			console.error("Error reading terminal log:", error);
		}
	}

	private async processTerminalOutput(
		output: string,
		terminal: vscode.Terminal
	) {
		// Process the captured output
		const config = vscode.workspace.getConfiguration("terminalCopilot");

		if (this.shouldAnalyze(output)) {
			if (config.get<boolean>("autoCopy", true)) {
				await vscode.env.clipboard.writeText(output);
			}

			if (config.get<boolean>("autoSendToLLM", false)) {
				await this.sendToLLM(output);
			}
		}
	}

	private shouldAnalyze(content: string): boolean {
		const config = vscode.workspace.getConfiguration("terminalCopilot");
		const keywords = config.get<string[]>("triggerKeywords", [
			"error",
			"failed",
		]);

		return keywords.some((keyword: string) =>
			content.toLowerCase().includes(keyword.toLowerCase())
		);
	}

	private async sendToLLM(output: string) {
		// Enhanced implementation for sending to LLM
		try {
			// Try multiple LLM providers in order of preference
			const providers = [
				{ command: "workbench.action.chat.open", name: "GitHub Copilot" },
				{ command: "codegpt.ask", name: "CodeGPT" },
				{ command: "chatgpt.ask", name: "ChatGPT" },
			];

			const prompt = this.createAnalysisPrompt(output);

			for (const provider of providers) {
				try {
					await vscode.commands.executeCommand(provider.command, {
						query: prompt,
					});
					vscode.window.showInformationMessage(
						`Sent to ${provider.name} for analysis`
					);
					return;
				} catch (providerError) {
					continue;
				}
			}

			// Fallback: copy to clipboard and show manual option
			await vscode.env.clipboard.writeText(prompt);
			vscode.window
				.showWarningMessage(
					"No LLM provider available. Analysis prompt copied to clipboard.",
					"Open Chat"
				)
				.then((selection: string | undefined) => {
					if (selection === "Open Chat") {
						vscode.commands.executeCommand("workbench.action.chat.open");
					}
				});
		} catch (error) {
			console.error("Failed to send to LLM:", error);
			vscode.window.showErrorMessage("Failed to analyze terminal output");
		}
	}

	public dispose() {
		this.watchers.forEach((watcher) => watcher.close());
		this.watchers.clear();
	}

	private createAnalysisPrompt(output: string): string {
		return `I encountered an issue in my terminal. Please analyze this output and provide:

1. What went wrong
2. Possible solutions
3. Best practices to avoid this issue

Terminal Output:
\`\`\`
${output}
\`\`\`

Focus on actionable solutions and explanations.`;
	}
}
