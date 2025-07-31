import * as vscode from 'vscode';
import { ConfigValidator } from './config-validator';
import { setTimeout } from 'timers';

interface TerminalSession {
    terminal: vscode.Terminal;
    lastCommand: string;
    lastOutput: string;
    timestamp: Date;
}

export class TerminalCopilotProvider implements vscode.Disposable {
    private terminalSessions: Map<string, TerminalSession> = new Map();
    private activeTerminal: vscode.Terminal | undefined;
    private outputChannel: vscode.OutputChannel;
    private disposables: vscode.Disposable[] = [];
    private statusBarItem!: vscode.StatusBarItem;

    constructor(private context: vscode.ExtensionContext) {
        this.outputChannel = vscode.window.createOutputChannel('Terminal Copilot');
        this.setupStatusBar();
        this.setupTerminalWatcher();
        
        // Validate configuration on startup
        ConfigValidator.validateConfiguration();
    }

    private setupStatusBar() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'terminalCopilot.captureNow';
        this.statusBarItem.text = '$(eye) Terminal Copilot';
        this.statusBarItem.tooltip = 'Click to capture terminal output now';
        this.statusBarItem.show();
    }

    private setupTerminalWatcher() {
        // Listen to terminal creation
        this.disposables.push(
            vscode.window.onDidOpenTerminal((terminal: vscode.Terminal) => {
                this.registerTerminal(terminal);
            })
        );

        // Listen to active terminal changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTerminal((terminal: vscode.Terminal | undefined) => {
                this.activeTerminal = terminal;
                this.updateStatusBar();
            })
        );

        // Listen to terminal close
        this.disposables.push(
            vscode.window.onDidCloseTerminal((terminal: vscode.Terminal) => {
                this.unregisterTerminal(terminal);
            })
        );

        // Register existing terminals
        vscode.window.terminals.forEach((terminal: vscode.Terminal) => {
            this.registerTerminal(terminal);
        });

        // Set initial active terminal
        this.activeTerminal = vscode.window.activeTerminal;
    }

    private registerTerminal(terminal: vscode.Terminal) {
        const terminalId = this.getTerminalId(terminal);
        
        if (!this.terminalSessions.has(terminalId)) {
            this.terminalSessions.set(terminalId, {
                terminal,
                lastCommand: '',
                lastOutput: '',
                timestamp: new Date()
            });
        }

        this.activeTerminal = terminal;
        this.updateStatusBar();
    }

    private unregisterTerminal(terminal: vscode.Terminal) {
        const terminalId = this.getTerminalId(terminal);
        this.terminalSessions.delete(terminalId);
    }

    private getTerminalId(terminal: vscode.Terminal): string {
        return `${terminal.name}-${terminal.processId || Math.random()}`;
    }

    private updateStatusBar() {
        if (this.activeTerminal) {
            this.statusBarItem.text = '$(eye) Terminal Copilot';
            this.statusBarItem.tooltip = `Monitoring: ${this.activeTerminal.name} (Click to capture)`;
        } else {
            this.statusBarItem.text = '$(eye-closed) Terminal Copilot';
            this.statusBarItem.tooltip = 'No active terminal (Click to capture)';
        }
    }

    // NEW: Manual capture method
    public async manualCapture() {
        if (!this.activeTerminal) {
            vscode.window.showWarningMessage('No active terminal found');
            return;
        }

        try {
            this.statusBarItem.text = '$(sync~spin) Capturing...';
            
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Capturing terminal output...",
                cancellable: false
            }, async (progress: vscode.Progress<{ message?: string; increment?: number }>) => {
                progress.report({ increment: 0 });

                // Capture terminal content
                const content = await this.getTerminalContent();
                progress.report({ increment: 50 });

                if (content) {
                    const terminalId = this.getTerminalId(this.activeTerminal!);
                    let session = this.terminalSessions.get(terminalId);
                    
                    if (!session) {
                        // Create session if it doesn't exist
                        session = {
                            terminal: this.activeTerminal!,
                            lastCommand: 'manual-capture',
                            lastOutput: content,
                            timestamp: new Date()
                        };
                        this.terminalSessions.set(terminalId, session);
                    } else {
                        session.lastOutput = content;
                        session.timestamp = new Date();
                    }
                    
                    // Process the captured output
                    await this.processOutput(session);
                    progress.report({ increment: 100 });
                    
                    this.showStatusMessage(`Captured ${content.length} characters`);
                    this.statusBarItem.text = '$(check) Captured!';
                    setTimeout(() => this.updateStatusBar(), 2000);
                } else {
                    vscode.window.showWarningMessage('No terminal content captured');
                    this.statusBarItem.text = '$(error) Failed';
                    setTimeout(() => this.updateStatusBar(), 2000);
                }
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to capture terminal output: ${error}`);
            this.outputChannel.appendLine(`Manual capture error: ${error}`);
            this.statusBarItem.text = '$(error) Error';
            setTimeout(() => this.updateStatusBar(), 2000);
        }
    }

    private async getTerminalContent(): Promise<string> {
        try {
            // Save current clipboard content to restore later
            const originalClipboard = await vscode.env.clipboard.readText();
            
            // Select all terminal content
            await vscode.commands.executeCommand('workbench.action.terminal.selectAll');
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
            
            // Copy selection
            await vscode.commands.executeCommand('workbench.action.terminal.copySelection');
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
            
            // Get the copied content
            const content = await vscode.env.clipboard.readText();
            
            // Clear selection
            await vscode.commands.executeCommand('workbench.action.terminal.clearSelection');
            
            // Restore original clipboard if it was different and not empty
            if (originalClipboard !== content && originalClipboard.length > 0) {
                setTimeout(async () => {
                    try {
                        await vscode.env.clipboard.writeText(originalClipboard);
                    } catch (error) {
                        // Ignore clipboard restore errors
                    }
                }, 1000);
            }
            
            return content;
        } catch (error) {
            this.outputChannel.appendLine(`Error in getTerminalContent: ${error}`);
            return '';
        }
    }

    private async processOutput(session: TerminalSession) {
        const config = ConfigValidator.getValidatedConfig();
        
        // Truncate output if too long
        let output = session.lastOutput;
        if (output.length > config.maxOutputLength) {
            output = output.substring(output.length - config.maxOutputLength);
        }

        // Auto copy to clipboard
        if (config.autoCopy) {
            await vscode.env.clipboard.writeText(output);
            this.showStatusMessage('Terminal output copied to clipboard');
        }

        // Check if output should trigger analysis
        if (this.shouldAnalyze(output, config.triggerKeywords)) {
            this.outputChannel.appendLine(`Detected issue in terminal output at ${session.timestamp.toISOString()}`);
            this.outputChannel.appendLine(`Command: ${session.lastCommand}`);
            this.outputChannel.appendLine(`Output: ${output.substring(0, 500)}...`);

            if (config.autoSendToLLM) {
                await this.sendToLLM(session.lastCommand, output);
            } else {
                this.showAnalysisPrompt(session.lastCommand, output);
            }
        }
    }

    private shouldAnalyze(content: string, keywords: string[]): boolean {
        return keywords.some(keyword => 
            content.toLowerCase().includes(keyword.toLowerCase())
        );
    }

    private async sendToLLM(command: string, output: string) {
        try {
            const prompt = this.createAnalysisPrompt(command, output);
            
            // Try multiple LLM providers
            const providers = [
                { command: 'workbench.action.chat.open', name: 'GitHub Copilot' },
                { command: 'codegpt.ask', name: 'CodeGPT' },
                { command: 'chatgpt.ask', name: 'ChatGPT' }
            ];

            for (const provider of providers) {
                try {
                    await vscode.commands.executeCommand(provider.command, {
                        query: prompt
                    });
                    this.outputChannel.appendLine(`Sent to ${provider.name} for analysis`);
                    return;
                } catch (providerError) {
                    continue;
                }
            }
            
            // Fallback: copy to clipboard and show manual option
            await this.showManualAnalysisOption(command, output);
            
        } catch (error) {
            this.outputChannel.appendLine(`LLM integration error: ${error}`);
            await this.showManualAnalysisOption(command, output);
        }
    }

    private createAnalysisPrompt(command: string, output: string): string {
        return `I executed the command: "${command}" and got the following output with errors/warnings:

\`\`\`
${output}
\`\`\`

Please analyze this output and provide:
1. What went wrong
2. Possible solutions
3. Best practices to avoid this issue

Focus on actionable solutions and explanations.`;
    }

    private showAnalysisPrompt(command: string, output: string) {
        const message = `Terminal output contains issues. Would you like to analyze it with an LLM?`;
        
        vscode.window.showInformationMessage(
            message,
            'Analyze Now',
            'Copy to Clipboard',
            'Dismiss'
        ).then(async (selection: string | undefined) => {
            switch (selection) {
                case 'Analyze Now':
                    await this.sendToLLM(command, output);
                    break;
                case 'Copy to Clipboard':
                    await vscode.env.clipboard.writeText(this.createAnalysisPrompt(command, output));
                    this.showStatusMessage('Analysis prompt copied to clipboard');
                    break;
            }
        });
    }

    private async showManualAnalysisOption(command: string, output: string) {
        const prompt = this.createAnalysisPrompt(command, output);
        
        await vscode.env.clipboard.writeText(prompt);
        
        vscode.window.showWarningMessage(
            'No LLM integration found. Analysis prompt copied to clipboard.',
            'Open Chat',
            'OK'
        ).then(async (selection: string | undefined) => {
            if (selection === 'Open Chat') {
                await vscode.commands.executeCommand('workbench.action.chat.open');
            }
        });
    }

    private showStatusMessage(message: string) {
        vscode.window.setStatusBarMessage(`Terminal Copilot: ${message}`, 3000);
    }

    // Public methods for commands
    public async analyzeLastOutput() {
        const session = this.getActiveSession();
        if (!session || !session.lastOutput) {
            vscode.window.showWarningMessage('No terminal output to analyze');
            return;
        }

        await this.sendToLLM(session.lastCommand, session.lastOutput);
    }

    public async copyLastOutput() {
        const session = this.getActiveSession();
        if (!session || !session.lastOutput) {
            vscode.window.showWarningMessage('No terminal output to copy');
            return;
        }

        await vscode.env.clipboard.writeText(session.lastOutput);
        this.showStatusMessage('Last terminal output copied to clipboard');
    }

    public async toggleAutoCopy() {
        const config = vscode.workspace.getConfiguration('terminalCopilot');
        const current = config.get<boolean>('autoCopy', true);
        await config.update('autoCopy', !current, vscode.ConfigurationTarget.Global);
        
        this.showStatusMessage(`Auto copy ${!current ? 'enabled' : 'disabled'}`);
    }

    public async toggleAutoLLM() {
        const config = vscode.workspace.getConfiguration('terminalCopilot');
        const current = config.get<boolean>('autoSendToLLM', false);
        await config.update('autoSendToLLM', !current, vscode.ConfigurationTarget.Global);
        
        this.showStatusMessage(`Auto LLM analysis ${!current ? 'enabled' : 'disabled'}`);
    }

    private getActiveSession(): TerminalSession | undefined {
        if (!this.activeTerminal) return undefined;
        
        const terminalId = this.getTerminalId(this.activeTerminal);
        return this.terminalSessions.get(terminalId);
    }

    public dispose() {
        this.disposables.forEach(d => d.dispose());
        this.outputChannel.dispose();
        this.statusBarItem.dispose();
    }
}