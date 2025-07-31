import * as vscode from 'vscode';
import { setTimeout } from 'timers';

export class StatusBarManager {
		private statusBarItem: vscode.StatusBarItem;
		private isMonitoring: boolean = false;

		constructor() {
				this.statusBarItem = vscode.window.createStatusBarItem(
						vscode.StatusBarAlignment.Right,
						100
				);
				this.statusBarItem.command = 'terminalCopilot.captureNow';
				this.updateStatusBar();
				this.statusBarItem.show();
		}

		public setMonitoring(monitoring: boolean) {
				this.isMonitoring = monitoring;
				this.updateStatusBar();
		}

		public showActivity(message: string) {
				this.statusBarItem.text = `$(sync~spin) ${message}`;
				setTimeout(() => this.updateStatusBar(), 2000);
		}

		public showSuccess(message: string) {
				this.statusBarItem.text = `$(check) ${message}`;
				setTimeout(() => this.updateStatusBar(), 3000);
		}

		public showError(message: string) {
				this.statusBarItem.text = `$(error) ${message}`;
				setTimeout(() => this.updateStatusBar(), 3000);
		}

		private updateStatusBar() {
				const icon = this.isMonitoring ? '$(eye)' : '$(eye-closed)';
				this.statusBarItem.text = `${icon} Hydra Terminal`;
				this.statusBarItem.tooltip = this.isMonitoring 
						? 'Hydra Terminal is monitoring (Click to capture now)'
						: 'Hydra Terminal is idle (Click to capture now)';
		}

		public dispose() {
				this.statusBarItem.dispose();
		}
}