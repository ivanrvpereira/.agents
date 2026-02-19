## Web Content & Research

- Always use Exa MCP tools for web content and research:
  - `mcp__exa__web_search_exa` — web search
  - `mcp__exa__crawling_exa` — fetch/scrape a specific URL (prefer over WebFetch)
  - `mcp__exa__get_code_context_exa` — programming docs, APIs, libraries
  - `mcp__exa__deep_researcher_start` — complex research requiring synthesis
- Delegate to a subagent to avoid raw page content polluting context
  - Use Task tool with subagent_type="general-purpose" and prompt properly to get what you need and useful links
- Never use WebFetch when Exa tools are available

