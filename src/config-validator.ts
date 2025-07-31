import * as vscode from 'vscode';

export class ConfigValidator {
		public static validateConfiguration(): boolean {
				const config = vscode.workspace.getConfiguration('terminalCopilot');
				
				try {
						// Validate trigger keywords
						const keywords = config.get<string[]>('triggerKeywords', []);
						if (!Array.isArray(keywords) || keywords.length === 0) {
								vscode.window.showWarningMessage(
										'Hydra Terminal: Invalid trigger keywords configuration. Using defaults.'
								);
								return false;
						}

						// Validate max output length
						const maxLength = config.get<number>('maxOutputLength', 5000);
						if (typeof maxLength !== 'number' || maxLength < 100 || maxLength > 50000) {
								vscode.window.showWarningMessage(
										'Hydra Terminal: Invalid max output length. Must be between 100-50000 characters.'
								);
								return false;
						}

						return true;
				} catch (error) {
						vscode.window.showErrorMessage(`Hydra Terminal: Configuration validation failed: ${error}`);
						return false;
				}
		}

		public static getValidatedConfig() {
				const config = vscode.workspace.getConfiguration('terminalCopilot');
				
				return {
						autoCopy: config.get<boolean>('autoCopy', true),
						autoSendToLLM: config.get<boolean>('autoSendToLLM', false),
						triggerKeywords: config.get<string[]>('triggerKeywords', ['error', 'failed', 'npm ERR!']),
						maxOutputLength: Math.min(Math.max(config.get<number>('maxOutputLength', 5000), 100), 50000)
				};
		}
}