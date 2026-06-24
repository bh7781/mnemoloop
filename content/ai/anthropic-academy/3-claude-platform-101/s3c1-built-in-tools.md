---
id: claude-platform-101-s3c1
course_name: Claude Platform 101
section: Extending your Agent
chapter: Built-in tools
source_type: course_notes
---

## Introduction

While custom tools allow Claude to interact with your own systems, some capabilities are common enough that Anthropic provides them as built-in tools.

With these tools:

- You do not write the implementation.
- You do not host the infrastructure.
- You simply declare the tool.
- Anthropic executes it on your behalf.

This significantly reduces the amount of code required to add advanced functionality.

## Server Tools

Server tools run entirely on Anthropic's infrastructure.

Unlike custom tools:

- Your application does not execute them.
- You do not manage an agent loop.
- Anthropic performs the tool execution automatically.

### How Server Tools Work

The workflow is:

1. Include the tool in the request.
2. Claude decides whether to use it.
3. Anthropic executes the tool.
4. The result is returned in the same response.

> **Key difference:** No manual tool execution or tool-result handling is required.

## Available Server Tools

Common server tools include:

| Tool | Purpose |
|---------|---------|
| Web search | Searches the internet and returns results with citations |
| Code execution | Writes and executes Python code in a sandbox |
| Web fetch | Retrieves and analyzes content from URLs |

## Example: Web Search and Code Execution

The following example demonstrates two built-in server tools in separate API calls.

### Full Example

```python
import anthropic

client = anthropic.Anthropic()

# Call 1: web search — Anthropic runs the search server-side
search_response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    tools=[{"type": "web_search_20260209", "name": "web_search"}],
    messages=[
        {"role": "user", "content": "What is Anthropic's latest model release? Answer in one sentence."}
    ],
)

for block in search_response.content:
    if block.type == "server_tool_use":
        print(f"Tool call: {block.name} — {block.input}")
    elif block.type == "text":
        print(block.text)

# Call 2: code execution — Claude writes and runs Python in a sandbox
code_response = client.messages.create(
    model="claude-opus-4-8",
    max_tokens=1024,
    tools=[{"type": "code_execution_20260120", "name": "code_execution"}],
    messages=[
        {"role": "user", "content": "Calculate the mean and standard deviation of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"}
    ],
)

for block in code_response.content:
    if block.type == "server_tool_use":
        print(f"Tool call: {block.name} — {block.input}")
    elif block.type == "bash_code_execution_tool_result":
        print(f"stdout: {block.content.stdout}")
    elif block.type == "text":
        print(block.text)
```

## Key Observations

### No Agent Loop Required

Unlike custom tools, there is no need to:

- Check `stop_reason`
- Execute a tool manually
- Return tool results
- Manage a loop

The entire interaction happens within a single API response.

### New Response Block Types

Server tools introduce additional response block types.

Common examples include:

| Block Type | Purpose |
|------------|------------|
| `server_tool_use` | Indicates a server-side tool invocation |
| `bash_code_execution_tool_result` | Contains output from executed code |
| `text` | Claude's normal text response |

## Running the Example

### Web Search

When the web search request executes:

1. Claude invokes the search tool.
2. Anthropic performs the search.
3. Claude incorporates the results into its answer.

The response contains:

- A `server_tool_use` block
- Search results and citations
- A final text response

### Code Execution

When the code execution request runs:

1. Claude writes Python code.
2. Anthropic executes the code in a sandbox.
3. The output is returned.
4. Claude summarizes the result.

The response may include:

- A `server_tool_use` block
- Executed code output
- Standard output (`stdout`)
- A final text explanation

> **Benefit:** You gain search and sandboxed computation without building or hosting those systems yourself.

## The Other Category: Client Tools

Built-in tools are not limited to Anthropic-hosted services.

Anthropic also provides **client tools**, which run where your application runs.

### Characteristics

Client tools:

- Execute locally or within your environment
- Are provided through the SDK
- Include predefined schemas
- Include tool runners

This removes much of the setup required for custom tools.

### Examples

| Tool | Purpose |
|---------|---------|
| Memory | Read and write memory across sessions |
| Bash | Execute commands in a persistent shell environment |

Screenshot showing Anthropic's built-in tool catalog, including both server and client tools.

### Comparison

| Feature | Server Tools | Client Tools |
|----------|----------|----------|
| Execution location | Anthropic infrastructure | Your environment |
| Infrastructure management | Anthropic | You |
| Schema generation | Built-in | Built-in |
| Tool execution | Anthropic | SDK runner / local execution |

## Why Built-In Tools Matter

Built-in tools provide a fast path to capabilities that would otherwise require significant engineering effort.

Examples include:

- Internet search
- Data analysis
- Code execution
- Content retrieval
- Persistent memory

Instead of building and maintaining these systems yourself, you can enable them with a tool declaration.

## Production Example: Fact Checking

A proposal-review application might use web search to verify:

- Regulatory claims
- Numerical statements
- Industry references
- Public information

Workflow:

1. Submit the proposal to Claude.
2. Claude invokes web search.
3. Search results are analyzed.
4. Potential inaccuracies are flagged.

Screenshot showing a proposal-review application using web search to verify claims within a draft document.

> **Warning:** Information found on the internet is not automatically correct. Claude's findings should still be reviewed and validated.

## Benefits of Built-In Tools

| Benefit | Description |
|---------|---------|
| Less infrastructure | No need to host search engines or sandboxes |
| Faster development | Add advanced capabilities with minimal code |
| Reduced maintenance | Anthropic manages execution environments |
| Consistent integration | Uses the same tool interface as other Claude capabilities |
| Easier experimentation | Quickly test new workflows and features |

## Key Takeaways

- Anthropic provides built-in tools for common capabilities.
- Server tools run entirely on Anthropic's infrastructure.
- Web search, code execution, and web fetch are examples of server tools.
- Server-tool results are returned directly in the response, eliminating the need for an agent loop.
- Client tools execute in your environment but come with SDK-provided schemas and runners.
- Memory and bash are examples of client tools.
- Built-in tools allow developers to add sophisticated capabilities without building the underlying infrastructure.

## Recap

- Built-in tools extend Claude with prepackaged functionality.
- Server tools are declared in the `tools` array and executed by Anthropic.
- Responses contain `server_tool_use` and tool-result blocks alongside normal text responses.
- Client tools run within your environment but are simplified through SDK support.
- The same principle of hosted execution scales beyond tools to managed agents, where Anthropic runs the entire agent workflow on your behalf.