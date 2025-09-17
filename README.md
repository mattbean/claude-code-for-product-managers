# Claude Code for Product Managers

A specialized Claude Code configuration with custom agents and MCP integrations designed specifically for product management workflows.

## What's Included

- **Custom Agents**
  - `project-writer` - Writes concise product projects without implementation details
  - `internal-information-researcher` - Searches across all integrated systems for comprehensive information
- **Custom Commands**
  - `/delegate` - Coordinates tasks across multiple specialized agents
- **Pre-configured Permissions** for MCP integrations and productivity tools

## Prerequisites

Before using this configuration, you'll need:
1. Claude Code CLI installed and running
2. MCP servers configured for your integrations
3. API keys/tokens for each service you want to use

## Setup Instructions

### Step 1: Install Claude Code

Follow the official Claude Code installation guide:
https://docs.anthropic.com/en/docs/claude-code/getting-started

```bash
# Install Claude Code CLI (macOS)
brew install claude-code

# Or download directly from
# https://claude.ai/code
```

### Step 2: Clone This Repository

```bash
git clone https://github.com/mattbean/claude-code-for-product-managers.git
cd claude-code-for-product-managers
```

### Step 3: Set Up MCP Integrations

This configuration is designed to work with a variety of MCP servers. Install the ones relevant to your workflow.

### Step 4: Configure MCP Settings

1. Open Claude Code settings
2. Navigate to MCP Servers section
3. Add each MCP server with your credentials

### Step 5: Start Using Claude Code

1. Navigate to your project directory
2. Open Claude Code
3. The custom agents and commands will be automatically available

## Usage Examples

### Using Custom Agents

```
# Write a product project
Use the project-writer agent to create a project for improving user onboarding

# Research across all systems
Use the internal-information-researcher to find all discussions about pricing strategy
```

### Using the Delegate Command

```
/delegate Create a comprehensive competitive analysis for our main competitors
```

### MCP Integration Examples

```
# Search Linear issues
Scope, create, and modify issues

# Search Confluence
Look for the latest meeting notes and complete the action items from them
```

## Customization

### Adding New Agents

Create new agent files in `.claude/agents/` following the existing format:

```markdown
---
name: your-agent-name
description: Brief description of what this agent does
---

Agent instructions here...
```

### Modifying Permissions

Edit `.claude/settings.json` to adjust tool permissions as needed.

## Troubleshooting

### MCP Connections
- Ensure MCP servers are running: Check Claude Code logs
- Verify API credentials are correct
- Check network connectivity to external services

### Permissions Issues
- Review `.claude/settings.json` for proper tool permissions
- Ensure file paths in permissions match your system

## Contributing

Feel free to submit issues or pull requests with:
- New agent definitions
- Improved commands
- Additional MCP integration configurations
- Documentation improvements

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)

## License

MIT