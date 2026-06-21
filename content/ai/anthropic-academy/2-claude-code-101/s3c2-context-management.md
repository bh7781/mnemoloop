---
id: claude-code-101-s3c2
course_name: Claude Code 101
section: Daily workflows
chapter: Context Management
source_type: course_notes
---

Context is Claude's working memory. Every file it reads, every command it runs, every message you send — it all takes up space in the context window.

## What is the Context Window?

Think of the context window as the amount of space Claude can hold in its memory. Whenever you enter a prompt, Claude reads a file, runs a tool call, or receives a tool call result, it's all adding to the context window. Since there's a finite amount of space, it becomes important to optimize how you use it.

Diagram showing the context window as a grid of tokens — some taken, most available

## What Happens When Context Fills Up

When you approach the limit, the context window is automatically compacted. Compaction summarizes important details and removes unnecessary tool call results to free up space. Note that this process can potentially lose details.

Claude Code showing 'Compacting conversation...' as it summarizes the context

Claude Code displaying a compact summary of the previous conversation including key technical concepts and files

## Commands

You can run compaction manually with the `/compact` command. This compacts everything up to that point. It's handy when you want to free up context space while keeping a memory of what you previously worked on.

The `/compact` command in Claude Code's autocomplete menu

If you want to completely start from scratch with no memory of the previous session, run `/clear`. This removes everything.

Running `/clear` in Claude Code to start a fresh session

To check the state of your context, run the `/context` command. You'll get a high-level overview of your context size, the categories taking up the most space, and a visual graphic showing the breakdown.

Output of the `/context` command showing context usage breakdown with a visual bar chart

## When to Use Which

A general rule of thumb:

- Use `/compact` when you're working on a specific feature and running up against the context limit but need to continue. Keeping the context relevant to your current feature is important.
- Use `/clear` when you want to start a new feature. You don't want the previous conversation to introduce bias into something new. For things you want Claude to remember across sessions, put them in your `CLAUDE.md` file so it doesn't have to rediscover things from scratch.

A `CLAUDE.md` file with commands, important notes, and architecture sections

## Tips for Saving Context Space

- Be specific. A vague prompt might seem smaller, but it actually costs more context in the long run. Without clear instructions, Claude is forced to explore your codebase more and do its own reasoning — which takes up far more context space than a detailed prompt would.
- Manage your MCP servers. MCP servers load all of their available tools into context by default, even when you're not using them. If you have servers configured for things unrelated to the current project, consider turning them off. You can also try "Skills," which work similarly to MCP servers but don't load everything into context upfront.
- Use subagents. Subagents run in parallel with your main agent but have a completely separate context window. For tasks where you only need the answer — like "where are the authentication endpoints located?" — a subagent does the work and returns just a summary to your main agent, keeping your primary context clean.

## Recap

Managing context within Claude Code is crucial. Use `/compact` to summarize long sessions and `/clear` to start fresh. To use your context window effectively: be specific with your prompts, check what's consuming your current context, and use subagents to delegate tasks where you only need the result.