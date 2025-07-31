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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const terminal_copilot_1 = require("./terminal-copilot");
function activate(context) {
    console.log("Terminal Copilot extension is now active!");
    try {
        const terminalCopilot = new terminal_copilot_1.TerminalCopilotProvider(context);
        // Register all commands with error handling
        const commands = [
            {
                command: "terminalCopilot.analyzeLastOutput",
                handler: () => terminalCopilot.analyzeLastOutput(),
            },
            {
                command: "terminalCopilot.copyLastOutput",
                handler: () => terminalCopilot.copyLastOutput(),
            },
            {
                command: "terminalCopilot.toggleAutoCopy",
                handler: () => terminalCopilot.toggleAutoCopy(),
            },
            {
                command: "terminalCopilot.toggleAutoLLM",
                handler: () => terminalCopilot.toggleAutoLLM(),
            },
            {
                command: "terminalCopilot.captureNow",
                handler: () => terminalCopilot.manualCapture(),
            },
        ];
        // Register commands with error handling wrapper
        commands.forEach(({ command, handler }) => {
            const disposable = vscode.commands.registerCommand(command, async () => {
                try {
                    await handler();
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Terminal Copilot: ${error}`);
                    console.error(`Error in ${command}:`, error);
                }
            });
            context.subscriptions.push(disposable);
        });
        context.subscriptions.push(terminalCopilot);
        // Show activation message with quick setup
        vscode.window
            .showInformationMessage("Terminal Copilot is active! 🚀", "Quick Setup", "View Commands", "Settings")
            .then((selection) => {
            switch (selection) {
                case "Quick Setup":
                    showQuickSetup();
                    break;
                case "View Commands":
                    vscode.commands.executeCommand("workbench.action.showCommands", "Terminal Copilot");
                    break;
                case "Settings":
                    vscode.commands.executeCommand("workbench.action.openSettings", "terminalCopilot");
                    break;
            }
        });
    }
    catch (error) {
        vscode.window.showErrorMessage(`Failed to activate Terminal Copilot: ${error}`);
        console.error("Activation error:", error);
    }
}
exports.activate = activate;
function showQuickSetup() {
    const panel = vscode.window.createWebviewPanel("terminalCopilotSetup", "Terminal Copilot Setup", vscode.ViewColumn.One, { enableScripts: true });
    panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Terminal Copilot Setup</title>
            <style>
                body { font-family: var(--vscode-font-family); padding: 20px; }
                .feature { margin: 15px 0; padding: 10px; border: 1px solid var(--vscode-panel-border); }
                .shortcut { background: var(--vscode-textCodeBlock-background); padding: 2px 6px; border-radius: 3px; }
            </style>
        </head>
        <body>
            <h1>🚀 Terminal Copilot Quick Setup</h1>
            
            <div class="feature">
                <h3>📋 Auto Copy Terminal Output</h3>
                <p>Automatically copy terminal output to clipboard when errors are detected.</p>
                <p><strong>Status:</strong> Enabled by default</p>
            </div>

            <div class="feature">
                <h3>🤖 Auto LLM Analysis</h3>
                <p>Automatically send terminal errors to LLM for analysis.</p>
                <p><strong>Status:</strong> Disabled by default (enable in settings)</p>
            </div>

            <div class="feature">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <ul>
                    <li><span class="shortcut">Ctrl+Shift+T</span> - Analyze last terminal output</li>
                    <li><span class="shortcut">Ctrl+Shift+C</span> - Copy last terminal output</li>
                    <li><span class="shortcut">Ctrl+Shift+X</span> - Capture terminal output now</li>
                </ul>
            </div>

            <div class="feature">
                <h3>🔧 Trigger Keywords</h3>
                <p>These keywords trigger automatic analysis:</p>
                <code>error, failed, npm ERR!, warning, deprecated</code>
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol>
                <li>Open a terminal and run a command that produces an error</li>
                <li>Watch for automatic detection and clipboard copy</li>
                <li>Use <span class="shortcut">Ctrl+Shift+T</span> to analyze with LLM</li>
                <li>Customize settings as needed</li>
            </ol>
        </body>
        </html>
    `;
}
function deactivate() {
    console.log("Terminal Copilot extension deactivated");
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map