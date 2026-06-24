---
id: claude-platform-101-s3c4
course_name: Claude Platform 101
section: Extending your Agent
chapter: Context management
source_type: course_notes
---

## Introduction

Every Claude request operates within a finite context window.

Although modern models can support very large context windows, long-running agents can still exhaust available context through:

- Message history
- Tool calls
- Files
- Skills
- Thinking blocks
- System prompts

Context management is the discipline of keeping the most important information available to Claude while staying within context limits and controlling costs.

## What Counts as Context?

Context includes everything Claude can see during a request.

### Components of Context

- System prompt
- Message history
- Tool definitions
- Tool results
- Attached files
- Skills
- Thinking blocks

Diagram illustrating the components of context: system prompt, message history, tools, files and skills, and thinking blocks.

### Why Context Matters

Context affects:

- Model behavior
- Request costs
- Performance
- Success or failure of the request

Every token included in a request contributes to:

- Input token costs
- Context window consumption

> **Important:** When the context window is exceeded, the request fails.

The objective is not to include everything—it is to include the right information.

## Four Context Management Patterns

Anthropic recommends four primary approaches for managing context in long-running systems:

1. Just-in-time context
2. Server-side compaction
3. Prompt caching
4. Memory

Diagram illustrating the four context-management patterns: just-in-time context, compaction, caching, and memory.

Each pattern solves a different problem and can be combined with the others.

## Pattern 1: Just-in-Time Context

Just-in-time context is a design strategy rather than a dedicated API feature.

### Core Idea

Do not load all information into Claude upfront.

Instead:

1. Provide only the information needed immediately.
2. Allow Claude to retrieve additional information through tools when necessary.

### Example: Compliance Review Agent

A compliance-review agent may need access to an entire building code library.

A poor approach would be:

```text
Load the entire building code into the system prompt.
```

A better approach is:

```text
Provide a lookup_building_code tool.
```

When Claude needs a specific section, it requests it through the tool.

### Benefits

- Smaller context size
- Lower costs
- More scalable workflows
- Better use of available context

> **Key takeaway:** Load information when it is needed rather than all at once.

## Pattern 2: Server-Side Compaction

Long-running conversations can accumulate large amounts of history.

Server-side compaction automatically summarizes older content to preserve important information while reducing context usage.

### Enabling Compaction

```python
response = client.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=1024,
    context_management={
        "edits": [
            {"type": "compact"}
        ]
    },
    messages=messages,
)
```

### How It Works

When the conversation reaches a threshold:

1. Older turns are summarized.
2. The summary replaces the original content.
3. Context usage decreases.
4. Important information remains available.

### Benefits

- Automatic operation
- Reduced context growth
- Less manual conversation management
- Better support for long-running agents

> **Note:** The API handles compaction automatically once enabled.

## Pattern 3: Prompt Caching

Many requests repeatedly include the same content.

Examples:

- System prompts
- Tool definitions
- Long reference documents
- Reusable instructions

Prompt caching allows these stable components to be reused across requests.

### Core Idea

Instead of repeatedly processing identical prompt content:

1. Cache the stable content.
2. Reference it in future requests.
3. Pay a fraction of the normal processing cost.

### Example

Imagine:

- A 4,000-token system prompt
- 100 requests per hour

Without caching:

```text
4,000 tokens × 100 requests
```

With caching:

```text
The prompt is reused at significantly lower cost.
```

### Benefits

- Reduced token costs
- Faster repeated requests
- Lower operational expenses
- Improved scalability

> **Prompt caching is especially valuable for applications with large, reusable prompts.**

## Pattern 4: Memory

Some information needs to persist beyond a single conversation.

Examples include:

- User preferences
- Project history
- Decisions from previous sessions
- Agent notes
- Long-term context

The recommended solution is the memory tool.

### How Memory Works

The memory system follows this pattern:

1. Claude reads memory through tool calls.
2. Claude writes memory through tool calls.
3. Your application stores the data.
4. Future sessions can retrieve the stored information.

### Storage Ownership

You control the storage backend.

Possible implementations include:

- File systems
- Databases
- Encrypted storage
- Cloud storage services

### Automatic Memory Instructions

Anthropic automatically injects a system instruction directing Claude to:

```text
Check memory before starting work.
```

This encourages Claude to retrieve relevant information before performing tasks.

Screenshot showing a memory directory with stored notes and categorized folders from previous sessions.

### Benefits

- Persistence across sessions
- Personalized experiences
- Long-term agent state
- Improved continuity

## Layering the Patterns

Production systems rarely use just one context-management strategy.

Instead, multiple patterns are combined.

### Example: Compliance Review Agent

The agent might use:

| Pattern | Purpose |
|----------|----------|
| Prompt caching | Cache system prompts and tool definitions |
| Just-in-time context | Retrieve building code sections only when needed |
| Compaction | Manage lengthy conversations automatically |
| Memory | Preserve findings and historical decisions |

Each pattern addresses a different limitation.

### Common Problems and Solutions

| Problem | Pattern |
|----------|----------|
| Excessive token costs | Prompt caching |
| Context window exhaustion | Compaction |
| Too much information loaded upfront | Just-in-time context |
| Loss of information between sessions | Memory |

> **Best practice:** Combine multiple patterns to address different context-management challenges.

## Benefits of Context Management

| Benefit | Description |
|---------|---------|
| Lower costs | Reduce token consumption |
| Better scalability | Support longer workflows |
| Improved reliability | Avoid context-window failures |
| Persistence | Maintain information across sessions |
| More efficient retrieval | Load information only when needed |

## Key Takeaways

- Context includes everything Claude sees during a request.
- Context consumes tokens and is limited by the model's context window.
- Just-in-time context loads information only when needed.
- Server-side compaction automatically summarizes older conversation history.
- Prompt caching reduces costs for reusable prompt components.
- Memory enables information to persist across sessions.
- Production systems often combine all four approaches.

## Recap

- Context is finite and contributes directly to cost and request limits.
- Just-in-time context is a design pattern that retrieves information on demand.
- Server-side compaction automatically compresses long conversations.
- Prompt caching reuses stable prompt content at reduced cost.
- Memory provides persistent state across sessions while allowing you to control the storage backend.
- The four patterns work together to manage context size, reduce costs, and preserve important information.
- Claude managed agents include caching and compaction by default, reducing the amount of context-management infrastructure you need to build yourself.