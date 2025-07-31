# Change Log

All notable changes to the "Hydra Terminal" extension will be documented in this file.

## [1.0.0] - 2025-07-31

### Added
- Initial stable release of Hydra Terminal
- Automatic terminal output monitoring and capture
- Integration with LLM services for error analysis
- Configurable trigger keywords for automatic detection
- Keyboard shortcuts for quick access to features
- Status bar integration showing monitoring status
- Auto-copy functionality for terminal output
- Quick setup wizard for new users
- Support for multiple terminal types and shells

### Features
- **Auto Copy**: Automatically copy terminal output when errors are detected
- **LLM Analysis**: Send terminal errors to LLM for intelligent analysis
- **Keyboard Shortcuts**: Quick access with Ctrl+Shift+T, Ctrl+Shift+C, Ctrl+Shift+X
- **Configurable Triggers**: Customize keywords that trigger automatic analysis
- **Status Bar**: Real-time monitoring status display
- **Quick Setup**: Guided setup process for new users

### Configuration Options
- `terminalCopilot.autoCopy`: Enable/disable automatic clipboard copying
- `terminalCopilot.autoSendToLLM`: Enable/disable automatic LLM analysis
- `terminalCopilot.triggerKeywords`: Customize trigger keywords
- `terminalCopilot.maxOutputLength`: Set maximum output length to capture

### Commands
- `terminalCopilot.analyzeLastOutput`: Analyze last terminal output
- `terminalCopilot.copyLastOutput`: Copy last terminal output
- `terminalCopilot.toggleAutoCopy`: Toggle auto copy feature
- `terminalCopilot.toggleAutoLLM`: Toggle auto LLM analysis
- `terminalCopilot.captureNow`: Manually capture terminal output
