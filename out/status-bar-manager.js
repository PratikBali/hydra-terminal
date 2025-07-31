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
exports.StatusBarManager = void 0;
const vscode = __importStar(require("vscode"));
const timers_1 = require("timers");
class StatusBarManager {
    constructor() {
        this.isMonitoring = false;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'terminalCopilot.captureNow';
        this.updateStatusBar();
        this.statusBarItem.show();
    }
    setMonitoring(monitoring) {
        this.isMonitoring = monitoring;
        this.updateStatusBar();
    }
    showActivity(message) {
        this.statusBarItem.text = `$(sync~spin) ${message}`;
        (0, timers_1.setTimeout)(() => this.updateStatusBar(), 2000);
    }
    showSuccess(message) {
        this.statusBarItem.text = `$(check) ${message}`;
        (0, timers_1.setTimeout)(() => this.updateStatusBar(), 3000);
    }
    showError(message) {
        this.statusBarItem.text = `$(error) ${message}`;
        (0, timers_1.setTimeout)(() => this.updateStatusBar(), 3000);
    }
    updateStatusBar() {
        const icon = this.isMonitoring ? '$(eye)' : '$(eye-closed)';
        this.statusBarItem.text = `${icon} Terminal Copilot`;
        this.statusBarItem.tooltip = this.isMonitoring
            ? 'Terminal Copilot is monitoring (Click to capture now)'
            : 'Terminal Copilot is idle (Click to capture now)';
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
//# sourceMappingURL=status-bar-manager.js.map