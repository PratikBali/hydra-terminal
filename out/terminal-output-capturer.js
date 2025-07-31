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
exports.TerminalOutputCapturer = void 0;
const vscode = __importStar(require("vscode"));
class TerminalOutputCapturer {
    constructor() {
        this.outputBuffer = new Map();
        this.lastCaptureTime = new Map();
    }
    async captureTerminalOutput(terminal) {
        const terminalId = this.getTerminalId(terminal);
        const now = Date.now();
        const lastCapture = this.lastCaptureTime.get(terminalId) || 0;
        // Avoid too frequent captures
        if (now - lastCapture < 1000) {
            return this.outputBuffer.get(terminalId) || '';
        }
        try {
            // Method 1: Use clipboard workaround
            const clipboardContent = await this.captureViaClipboard();
            // Method 2: Try to read from terminal buffer (if available)
            const bufferContent = await this.captureViaBuffer(terminal);
            const content = bufferContent || clipboardContent;
            if (content) {
                this.outputBuffer.set(terminalId, content);
                this.lastCaptureTime.set(terminalId, now);
            }
            return content;
        }
        catch (error) {
            console.error('Failed to capture terminal output:', error);
            return '';
        }
    }
    async captureViaClipboard() {
        try {
            // Save current clipboard content
            const originalClipboard = await vscode.env.clipboard.readText();
            // Select all terminal content and copy
            await vscode.commands.executeCommand('workbench.action.terminal.selectAll');
            await vscode.commands.executeCommand('workbench.action.terminal.copySelection');
            // Get the copied content
            const terminalContent = await vscode.env.clipboard.readText();
            // Clear selection
            await vscode.commands.executeCommand('workbench.action.terminal.clearSelection');
            // Restore original clipboard (optional)
            // await vscode.env.clipboard.writeText(originalClipboard);
            return terminalContent;
        }
        catch (error) {
            return '';
        }
    }
    async captureViaBuffer(terminal) {
        // This would require access to terminal internals
        // Currently not available in VS Code API
        return '';
    }
    getTerminalId(terminal) {
        return `${terminal.name}-${terminal.processId || Math.random()}`;
    }
}
exports.TerminalOutputCapturer = TerminalOutputCapturer;
//# sourceMappingURL=terminal-output-capturer.js.map