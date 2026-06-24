---
id: claude-platform-101-s2c2
course_name: Claude Platform 101
section: Teaching your Agent
chapter: What is tool use?
source_type: course_notes
---

## Introduction

Most real-world workflows depend on external systems such as:

- Project management tools
- Databases
- Files
- Internal services
- Third-party APIs

Claude cannot directly access these systems on its own. Instead, it relies on **tools**, which allow Claude to retrieve information and perform actions through your application.

## What a Tool Is

A tool is a function that you define and expose to Claude.

You describe:

- What the tool does
- What inputs it accepts

Claude then decides when the tool should be used.

### The Tool Use Flow

A critical concept is that Claude does **not** execute tools.

Your application executes them.

The workflow looks like this:

1. Claude requests a tool call.
2. Your code executes the tool.
3. The result is returned to Claude.
4. Claude continues reasoning.

> **Key takeaway:** Claude chooses the tool. Your code runs the tool.

## How Tools Are Defined

Tools are defined as JSON schemas and passed to the API through a `tools` array.

Each tool contains three parts:

| Field | Purpose |
|---------|---------|
| `name` | Unique identifier for the tool |
| `description` | Explains what the tool does and when it should be used |
| `input_schema` | Defines the tool's accepted inputs using JSON Schema |

### Example Tool Definition

```json
{
  "name": "lookup_building_code",
  "description": "Look up a specific building code section by its identifier. Returns the full text of that code section.",
  "input_schema": {
    "type": "object",
    "properties": {
      "section": {
        "type": "string",
        "description": "The building code section to look up"
      }
    },
    "required": ["section"]
  }
}
```

### Why Descriptions Matter

Claude reads the tool description when deciding whether to use a tool.

Poor descriptions lead to poor tool selection.

> **Warning:** Vague tool descriptions are one of the most common reasons agents fail to use available tools correctly.

A strong description should clearly explain:

- What the tool does
- What information it returns
- When Claude should use it

## Tool Use in Practice

Consider a compliance-review agent that receives a report and needs to reference building codes.

### Step 1: Claude Requests a Tool

Claude responds with:

```text
stop_reason = "tool_use"
```

The response contains a `tool_use` block specifying:

- Which tool to call
- Which inputs to provide

Screenshot showing an API response with `stop_reason` set to `tool_use` and a `tool_use` content block containing the requested tool name and inputs.

### Step 2: Execute the Tool

Your application executes:

```text
lookup_building_code(section)
```

using the parameters Claude requested.

### Step 3: Return a Tool Result

The result is sent back to Claude as a `tool_result` block.

Example structure:

```json
{
  "type": "tool_result",
  "tool_use_id": "tool-id",
  "content": "Building code text..."
}
```

Screenshot showing a user message containing a `tool_result` block linked to the original tool call.

### Step 4: Continue the Loop

Claude receives the result and continues reasoning.

It may:

- Produce a final answer
- Request another tool
- Request multiple additional tools

The loop continues until Claude reaches a final response.

## Multiple Tools: Letting Claude Choose

The real power of tool use comes from exposing multiple tools and allowing Claude to select the appropriate one.

### Example Scenario

A user asks:

```text
I'm packing for a three-day trip to Denver. What's the weather today and over the next few days?
```

Two tools are available:

- `get_weather`
- `get_forecast`

### Tool Definitions

```javascript
const tools = [
  {
    name: "get_weather",
    description: "Get today's current weather for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "The city to check" }
      },
      required: ["city"]
    }
  },
  {
    name: "get_forecast",
    description: "Get the weather forecast for the next few days for a city.",
    input_schema: {
      type: "object",
      properties: {
        city: { type: "string", description: "The city to check" }
      },
      required: ["city"]
    }
  }
];
```

## Implementing a Tool Runner Manually

The application executes the requested tools using a dispatch function.

### Tool Dispatch Function

```javascript
function runTool(name, input) {
  switch (name) {
    case "get_weather":
      return getWeather(input.city);
    case "get_forecast":
      return getForecast(input.city);
  }
}
```

### Agent Loop

```javascript
while (true) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages,
    tools,
  });

  if (response.stop_reason !== "tool_use") {
    // Claude is done — this is the final answer
    break;
  }

  messages.push({ role: "assistant", content: response.content });

  const toolResults = response.content
    .filter((block) => block.type === "tool_use")
    .map((block) => ({
      type: "tool_result",
      tool_use_id: block.id,
      content: runTool(block.name, block.input),
    }));

  messages.push({ role: "user", content: toolResults });
}
```

### What Happens?

Claude evaluates the request and determines:

- Today's weather requires `get_weather`
- Future weather requires `get_forecast`

It may call:

- Both tools in one turn
- One tool at a time over multiple turns

The decision is based largely on the tool descriptions.

> **Note:** Better tool descriptions lead to better tool selection.

## The Tool Runner

Writing manual tool loops can become repetitive.

Common challenges include:

- Maintaining JSON schemas
- Writing dispatch logic
- Managing tool-result messages
- Handling the agent loop

The Claude SDK provides a **tool runner** to automate these tasks.

### Benefits

The tool runner:

- Builds schemas automatically
- Handles tool execution loops
- Manages tool-result messages
- Simplifies application code

Available SDKs:

- TypeScript
- Python
- Ruby

## Tool Runner Example

### Existing Functions

```typescript
function getWeather(city: string) {
  // ...existing lookup
}

function getForecast(city: string) {
  // ...existing lookup
}
```

### Tool Runner Implementation

```typescript
const runner = client.beta.messages.toolRunner({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  messages: [
    {
      role: "user",
      content:
        "I'm packing for a three-day trip to Denver. What's the weather today and over the next few days?",
    },
  ],
  tools: [getWeather, getForecast],
});

// Returns the final assistant message after all the tool ping-pong has settled
const finalMessage = await runner.untilDone();
```

### What the Tool Runner Handles

Without the tool runner, you would need:

- A `while` loop
- `stop_reason` handling
- Manual schema creation
- Tool-result message management

With the tool runner:

- Functions become tools automatically
- The loop is handled internally
- The final response is returned through `runner.untilDone()`

## Real Tools Wrap Existing Code

Most production tools are thin wrappers around existing application functionality.

Examples:

| Tool | Underlying System |
|--------|--------|
| `lookup_building_code` | Internal code database |
| `search_building_code` | Search service |
| `get_customer_record` | CRM system |
| `create_ticket` | Help desk platform |
| `generate_invoice` | Billing service |

Rather than creating new systems specifically for Claude, tools typically expose functionality that already exists within the application.

### Example: Compliance Review Agent

A compliance-review agent might use tools such as:

- `lookup_building_code`
- `search_building_code`

The agent can:

1. Review a report.
2. Search relevant regulations.
3. Cite exact code sections.
4. Write findings back to the system.

Screenshot showing a compliance-review application with findings linked to specific building code citations.

## Key Takeaways

- Tools provide Claude with access to external systems and actions.
- A tool is a function you define and expose to Claude.
- Claude decides when to use a tool; your application executes it.
- Tool definitions consist of:
  - A name
  - A description
  - An input schema
- Tool descriptions significantly influence tool-selection quality.
- `stop_reason: "tool_use"` indicates that Claude is requesting a tool execution.
- Multiple tools can be exposed simultaneously, allowing Claude to choose among them.
- The SDK's tool runner automates schema generation and tool-loop management.

## Recap

- Tools bridge Claude and your existing systems.
- Claude requests tools through `tool_use` blocks, and your application returns results through `tool_result` blocks.
- Clear, specific descriptions improve tool-use reliability.
- Multiple tools can be exposed at the same time, allowing Claude to determine which tools best fit the task.
- The tool runner reduces boilerplate by handling schemas and agent loops automatically.
- You can either manage the loop yourself or delegate it through tooling and managed-agent infrastructure.