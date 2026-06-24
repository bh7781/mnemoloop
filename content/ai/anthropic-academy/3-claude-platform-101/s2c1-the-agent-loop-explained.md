---
id: claude-platform-101-s2c1
course_name: Claude Platform 101
section: Teaching your Agent
chapter: The agent loop explained
source_type: course_notes
---

## Introduction

A single API call produces a single response. To automate workflows, Claude must be able to:

1. Observe the current state.
2. Decide what action to take.
3. Execute an action through a tool.
4. Evaluate the result.
5. Continue until the task is complete.

This pattern is known as an **agentic workflow**.

## What an Agent Actually Is

An agent is an autonomous version of Claude that operates both sides of the messaging loop without requiring a human after the initial request.

An agent:

- Receives a task
- Chooses tools when needed
- Executes actions through those tools
- Processes the results
- Continues reasoning until the task is complete

### The Basic Agent Loop

The simplest agent loop follows this sequence:

1. Send a message to Claude along with available tools.
2. Claude responds with either:
   - A final answer, or
   - A request to use a tool.
3. Your application executes the requested tool.
4. The tool result is sent back to Claude.
5. Repeat until Claude signals completion.

The loop ends when the response `stop_reason` is:

```text
end_turn
```

Conceptually, the interaction alternates between:

- User
- Agent
- Tool
- Agent
- Tool
- Agent

until a final answer is produced.

## A Minimal Working Example

To demonstrate the loop, consider a simple tool called `get_weather`.

The user asks:

```text
What should I wear in Austin today?
```

Claude does not know the current weather, so it must:

1. Request the weather tool.
2. Read the result.
3. Generate a recommendation.

### Full Example

```python
import anthropic

client = anthropic.Anthropic()

# The tools array tells Claude what's available:
# a name, a description, and a JSON schema for the inputs.
tools = [
    {
        "name": "get_weather",
        "description": "Get the current weather for a city.",
        "input_schema": {
            "type": "object",
            "properties": {
                "city": {
                    "type": "string",
                    "description": "The city to get weather for",
                }
            },
            "required": ["city"],
        },
    }
]

# run_tool is just a hardcoded lookup.
# In a real app, this would hit your database, an API, whatever.
def run_tool(name, tool_input):
    if name == "get_weather":
        return f"Weather in {tool_input['city']}: 95F, sunny"
    raise ValueError(f"Unknown tool: {name}")

messages = [
    {"role": "user", "content": "What should I wear in Austin today?"}
]

# The agent loop. Each iteration sends messages to Claude
# and switches on the response's stop reason.
while True:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        tools=tools,
        messages=messages,
    )

    if response.stop_reason == "end_turn":
        # Claude is done. Print the final text and break.
        for block in response.content:
            if block.type == "text":
                print(block.text)
        break

    if response.stop_reason == "tool_use":
        # Find the tool use blocks in the response and run each one.
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = run_tool(block.name, block.input)
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    }
                )

        # Push the assistant's response and our tool results
        # back into messages, then loop again so Claude can answer.
        messages.append({"role": "assistant", "content": response.content})
        messages.append({"role": "user", "content": tool_results})
```

## Understanding the Components

### The Tools Array

The `tools` array tells Claude what capabilities are available.

Each tool includes:

| Field | Purpose |
|---------|---------|
| `name` | Unique identifier for the tool |
| `description` | Explains when and why the tool should be used |
| `input_schema` | Defines valid inputs using JSON Schema |

Example:

```python
{
    "name": "get_weather",
    "description": "Get the current weather for a city.",
    "input_schema": {
        ...
    }
}
```

### The Tool Implementation

The `run_tool()` function executes the actual work.

In this example:

```python
def run_tool(name, tool_input):
    if name == "get_weather":
        return f"Weather in {tool_input['city']}: 95F, sunny"
```

This is a simple mock implementation.

In production, a tool might:

- Query a database
- Call an external API
- Execute code
- Search internal systems
- Write data to storage

### The Agent Loop

The loop repeatedly sends messages to Claude and reacts to the response.

```python
while True:
```

Each iteration:

1. Calls `messages.create()`
2. Checks `response.stop_reason`
3. Either:
   - Ends the workflow, or
   - Executes requested tools and continues

## Understanding `stop_reason`

The agent's next action depends on the response's `stop_reason`.

### `end_turn`

When Claude has completed the task:

```python
if response.stop_reason == "end_turn":
```

Actions:

1. Extract text content.
2. Display or return the result.
3. Exit the loop.

### `tool_use`

When Claude needs additional information:

```python
if response.stop_reason == "tool_use":
```

Actions:

1. Find all tool-use blocks.
2. Execute each tool.
3. Collect the results.
4. Send those results back to Claude.
5. Continue the loop.

## Running the Example

When executed, the workflow proceeds in two stages.

### Turn 1: Tool Request

Claude responds with:

```text
stop_reason = tool_use
```

Claude requests:

```text
get_weather(city="Austin")
```

The application executes the tool and returns:

```text
Weather in Austin: 95F, sunny
```

### Turn 2: Final Answer

Claude receives the weather data and responds with:

```text
stop_reason = end_turn
```

Claude then generates a recommendation such as:

```text
Wear light, breathable clothing due to the hot and sunny weather.
```

Screenshot showing terminal output where Claude first requests `get_weather` and then provides clothing recommendations after receiving the result.

> **Key observation:** Two API calls and one tool execution are enough to create a complete agent workflow.

## The Same Loop in Production

The exact same loop structure can power far more sophisticated systems.

### Example: Compliance Review Agent

Imagine a compliance-review application that:

1. Reads a structural report.
2. Searches building-code databases through tools.
3. Evaluates risks.
4. Writes findings back to a database.

Screenshot showing a compliance review dashboard with uploaded reports and a "Run auto-review" button.

### What Changes?

The loop remains identical.

Only the surrounding systems change:

| Demo Example | Production Example |
|-------------|-------------|
| Mock weather lookup | Real databases and APIs |
| Local execution | Distributed services |
| Printed results | Streaming UI updates |
| Temporary output | Persistent database records |

### Production Enhancements

Additional capabilities may include:

- Server-sent events (SSE) for live updates
- Database persistence
- Monitoring and observability
- Retry handling
- Queue management

Screenshot illustrating a running compliance agent making numerous building-code lookup tool calls.

## Who Owns What?

A useful mental model is:

| Responsibility | Owner |
|---------------|---------|
| Reasoning and decision-making | Claude |
| Agent loop implementation | Your application |
| Tool execution | Your application |
| Tool definitions | Your application |
| Final task completion | Claude |

> **Key takeaway:** You own the loop and the tools. Claude owns the reasoning.

## Managed Agents

Building and maintaining agent loops requires infrastructure.

When you do not want to manage:

- Loop execution
- Tool orchestration
- Scaling
- Operational concerns

you can use **managed agents**.

Managed agents run the same agent loop on Anthropic's infrastructure rather than your own.

## Recap

- An agent is Claude operating in a continuous observe-decide-act loop.
- The core workflow is:
  1. Send messages and tools.
  2. Execute requested tools.
  3. Return tool results.
  4. Repeat until `end_turn`.
- Tool definitions describe available capabilities using names, descriptions, and JSON schemas.
- The application executes tools; Claude decides when and how to use them.
- The same loop powers everything from simple weather demos to enterprise compliance systems.
- Managed agents provide the same loop without requiring you to operate the infrastructure yourself.