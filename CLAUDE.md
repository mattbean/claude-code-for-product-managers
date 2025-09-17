# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a Claude Code configuration repository designed for product managers. It contains specialized agents and commands to help with product management tasks, research, and project writing.

## Key Components

### Custom Agents (.claude/agents/)
- **project-writer**: Writes concise product projects focused on high-level thinking without implementation details. Avoids phases, timelines, and project planning.
- **internal-information-researcher**: Searches across all available systems (Slack, Confluence, Linear, Atlassian, web) and local files to find comprehensive information.

### Custom Commands (.claude/commands/)
- **/delegate**: Coordinates task completion across multiple specialized agents with proper planning, analysis, execution, and synthesis steps.

### Permissions Configuration
The repository is configured with extensive permissions for:
- MCP integrations (Atlassian, Confluence, Slack, Linear)
- Web fetching and searching capabilities
- File system access for user directories
- Task management and delegation tools

## Working with This Repository

When operating in this repository:
1. Leverage the custom agents for product-related tasks using the Task tool
2. Use the /delegate command for complex multi-step product tasks
3. Take advantage of the pre-configured MCP integrations for internal information research
4. Focus on high-level product thinking rather than technical implementation details when writing projects