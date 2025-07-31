# Hydra Terminal
3. Watch Hydra Terminal automatically detect and capture issues
4. Use `Ctrl+Shift+T` to analyze with LLM

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `Hydra Terminal: Analyze Last Output` | `Ctrl+Shift+T` | Analyze the last terminal output with LLM |
| `Hydra Terminal: Copy Last Output` | `Ctrl+Shift+C` | Copy terminal output to clipboard |
| `Hydra Terminal: Capture Terminal Output Now` | `Ctrl+Shift+X` | Manually capture current terminal output |
| `Hydra Terminal: Toggle Auto Copy` | - | Enable/disable automatic clipboard copying |
| `Hydra Terminal: Toggle Auto LLM Analysis` | - | Enable/disable automatic LLM analysis |

## Configuration

Configure Hydra Terminal through VS Code settings:minal** is a VS Code extension that automatically captures terminal output and provides intelligent analysis through LLM integration.

## Features

- **🔍 Automatic Terminal Monitoring**: Watches terminal output for errors and important events
- **📋 Smart Clipboard Integration**: Automatically copies terminal output when issues are detected
- **🤖 LLM Analysis**: Send terminal errors directly to your preferred LLM for analysis
- **⚡ Quick Actions**: Instant access to terminal analysis with keyboard shortcuts
- **🎯 Configurable Triggers**: Customize keywords that trigger automatic analysis
- **📊 Status Bar Integration**: Real-time monitoring status in your status bar

## Quick Start

1. Install the extension
2. Open a terminal in VS Code
3. Run commands that might produce errors
4. Watch Hydra Terminal automatically detect and capture issues
5. Use `Ctrl+Shift+T` to analyze with LLM

## Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `Hydra Terminal: Analyze Last Output` | `Ctrl+Shift+T` | Analyze the last terminal output with LLM |
| `Hydra Terminal: Copy Last Output` | `Ctrl+Shift+C` | Copy terminal output to clipboard |
| `Hydra Terminal: Capture Terminal Output Now` | `Ctrl+Shift+X` | Manually capture current terminal output |
| `Hydra Terminal: Toggle Auto Copy` | - | Enable/disable automatic clipboard copying |
| `Hydra Terminal: Toggle Auto LLM Analysis` | - | Enable/disable automatic LLM analysis |

## Configuration

Configure Hydra Terminal through VS Code settings:

```json
{
  "terminalCopilot.autoCopy": true,
  "terminalCopilot.autoSendToLLM": false,
  "terminalCopilot.triggerKeywords": [
    "error",
    "failed",
    "npm ERR!",
    "warning",
    "deprecated"
  ],
  "terminalCopilot.maxOutputLength": 5000
}
```

### Settings

- **`terminalCopilot.autoCopy`**: Automatically copy terminal output to clipboard when issues are detected
- **`terminalCopilot.autoSendToLLM`**: Automatically send terminal output to LLM for analysis
- **`terminalCopilot.triggerKeywords`**: Keywords that trigger automatic analysis
- **`terminalCopilot.maxOutputLength`**: Maximum length of terminal output to capture

## Usage Examples

### 1. Automatic Error Detection
```bash
npm install some-package
# Hydra Terminal detects "npm ERR!" and automatically copies output
```

### 2. Manual Analysis
```bash
# Run any command
python script.py
# Press Ctrl+Shift+T to analyze the output
```

### 3. Quick Setup
- Click on the Hydra Terminal status bar item for quick setup
- Or use the activation notification for guided setup

## LLM Integration

Hydra Terminal works with:
- **GitHub Copilot Chat** (recommended)
- Any VS Code LLM extension
- Manual clipboard copying for external LLMs

## Requirements

- VS Code 1.74.0 or higher
- No additional dependencies required

## Known Issues

- Terminal output capture may vary depending on the shell and terminal type
- Some terminal applications may not be fully supported

## Contributing

Found a bug or have a feature request? Please visit our [GitHub repository](https://github.com/pratikbali/hydra-terminal).

## Release Notes

### 0.0.1

Initial release of Hydra Terminal:
- Automatic terminal output monitoring
- LLM integration for error analysis
- Configurable trigger keywords
- Keyboard shortcuts for quick access
- Status bar integration

## License

This extension is licensed under the [MIT License](LICENSE).

---

**Enjoy using Hydra Terminal!** 🚀
