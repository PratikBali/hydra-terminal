import * as vscode from 'vscode';

export class TerminalOutputCapturer {
		private outputBuffer: Map<string, string> = new Map();
		private lastCaptureTime: Map<string, number> = new Map();

		public async captureTerminalOutput(terminal: vscode.Terminal): Promise<string> {
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
				} catch (error) {
						console.error('Failed to capture terminal output:', error);
						return '';
				}
		}

		private async captureViaClipboard(): Promise<string> {
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
				} catch (error) {
						return '';
				}
		}

		private async captureViaBuffer(terminal: vscode.Terminal): Promise<string> {
				// This would require access to terminal internals
				// Currently not available in VS Code API
				return '';
		}

		private getTerminalId(terminal: vscode.Terminal): string {
				return `${terminal.name}-${terminal.processId || Math.random()}`;
		}
}