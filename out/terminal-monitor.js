"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalMonitor = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class TerminalMonitor {
    constructor() {
        this.watchers = new Map();
        this.terminalLogPaths = new Map();
        this.setupTerminalLogging();
    }
    setupTerminalLogging() {
        // Monitor terminal creation to set up logging
        vscode.window.onDidOpenTerminal((terminal) => {
            this.setupTerminalFileWatcher(terminal); // Fix: Call the correct method
        });
    }
    async setupTerminalFileWatcher(terminal) {
        // This is a more advanced approach that would require
        // setting up terminal session logging to files
        const logPath = this.getTerminalLogPath(terminal);
        if (fs.existsSync(logPath)) {
            const watcher = fs.watch(logPath, (eventType, filename) => {
                if (eventType === "change") {
                    this.handleLogFileChange(logPath, terminal);
                }
            });
            this.watchers.set(terminal.name, watcher);
        }
    }
    getTerminalLogPath(terminal) {
        // Implementation would depend on terminal configuration
        // This is a conceptual approach
        return path.join(process.env.TEMP || "/tmp", `terminal-${terminal.name}.log`);
    }
    async handleLogFileChange(logPath, terminal) {
        try {
            const content = fs.readFileSync(logPath, "utf8");
            const lines = content.split("\n");
            const lastLines = lines.slice(-10); // Get last 10 lines
            // Process the new content
            await this.processTerminalOutput(lastLines.join("\n"), terminal);
        }
        catch (error) {
            console.error("Error reading terminal log:", error);
        }
    }
    async processTerminalOutput(output, terminal) {
        // Process the captured output
        const config = vscode.workspace.getConfiguration("terminalCopilot");
        if (this.shouldAnalyze(output)) {
            if (config.get("autoCopy", true)) {
                await vscode.env.clipboard.writeText(output);
            }
            if (config.get("autoSendToLLM", false)) {
                await this.sendToLLM(output);
            }
        }
    }
    shouldAnalyze(content) {
        const config = vscode.workspace.getConfiguration("terminalCopilot");
        const keywords = config.get("triggerKeywords", [
            "error",
            "failed",
        ]);
        return keywords.some((keyword) => content.toLowerCase().includes(keyword.toLowerCase()));
    }
    async sendToLLM(output) {
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
                    vscode.window.showInformationMessage(`Sent to ${provider.name} for analysis`);
                    return;
                }
                catch (providerError) {
                    continue;
                }
            }
            // Fallback: copy to clipboard and show manual option
            await vscode.env.clipboard.writeText(prompt);
            vscode.window
                .showWarningMessage("No LLM provider available. Analysis prompt copied to clipboard.", "Open Chat")
                .then((selection) => {
                if (selection === "Open Chat") {
                    vscode.commands.executeCommand("workbench.action.chat.open");
                }
            });
        }
        catch (error) {
            console.error("Failed to send to LLM:", error);
            vscode.window.showErrorMessage("Failed to analyze terminal output");
        }
    }
    dispose() {
        this.watchers.forEach((watcher) => watcher.close());
        this.watchers.clear();
    }
    createAnalysisPrompt(output) {
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
exports.TerminalMonitor = TerminalMonitor;
//# sourceMappingURL=terminal-monitor.js.map