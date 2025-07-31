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
exports.ConfigValidator = void 0;
const vscode = __importStar(require("vscode"));
class ConfigValidator {
    static validateConfiguration() {
        const config = vscode.workspace.getConfiguration('terminalCopilot');
        try {
            // Validate trigger keywords
            const keywords = config.get('triggerKeywords', []);
            if (!Array.isArray(keywords) || keywords.length === 0) {
                vscode.window.showWarningMessage('Terminal Copilot: Invalid trigger keywords configuration. Using defaults.');
                return false;
            }
            // Validate max output length
            const maxLength = config.get('maxOutputLength', 5000);
            if (typeof maxLength !== 'number' || maxLength < 100 || maxLength > 50000) {
                vscode.window.showWarningMessage('Terminal Copilot: Invalid max output length. Must be between 100-50000 characters.');
                return false;
            }
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Terminal Copilot: Configuration validation failed: ${error}`);
            return false;
        }
    }
    static getValidatedConfig() {
        const config = vscode.workspace.getConfiguration('terminalCopilot');
        return {
            autoCopy: config.get('autoCopy', true),
            autoSendToLLM: config.get('autoSendToLLM', false),
            triggerKeywords: config.get('triggerKeywords', ['error', 'failed', 'npm ERR!']),
            maxOutputLength: Math.min(Math.max(config.get('maxOutputLength', 5000), 100), 50000)
        };
    }
}
exports.ConfigValidator = ConfigValidator;
//# sourceMappingURL=config-validator.js.map