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

Claude Code is a CLI tool that runs directly in your browser or as a desktop app.

Follow the official Claude Code guide:
https://docs.claude.com/en/docs/claude-code/overview

To get started:
1. Visit https://claude.ai/code
2. Sign in with your Anthropic account
3. Claude Code will be available in your browser or you can download the desktop app

### Step 2: Clone This Repository

```bash
git clone https://github.com/mattbean/claude-code-for-product-managers.git
cd claude-code-for-product-managers
```

### Step 3: Add MCP Integrations

Add the MCP servers you want to use. Run these commands in your terminal:

#### Atlassian (Jira and Confluence)

```bash
claude mcp add --transport sse atlassian https://mcp.atlassian.com/v1/sse
```

#### Linear

```bash
claude mcp add --transport http linear https://mcp.linear.app/mcp
```

For more MCP servers and integrations, visit: https://code.claude.com/docs/en/mcp

### Step 4: Start Claude Code

Navigate to your project directory and start Claude Code:

```bash
cd claude-code-for-product-managers
claude
```

### Step 5: Authenticate MCP Servers

Inside Claude Code, run:

```
/mcp
```

This will authenticate each MCP server you added. The custom agents and commands will now be available.

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

- [Claude Code Documentation](https://docs.claude.com/en/docs/claude-code/overview)
- [MCP Server Repository](https://github.com/modelcontextprotocol/servers)
- [Linear API Documentation](https://developers.linear.app/docs)
- [Atlassian API Documentation](https://developer.atlassian.com/cloud/)

## License

MIT