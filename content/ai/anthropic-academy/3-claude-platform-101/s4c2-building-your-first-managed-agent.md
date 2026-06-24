---
id: claude-platform-101-s4c2
course_name: Claude Platform 101
section: Managed Agents
chapter: Building your first managed agent
source_type: course_notes
---

## Introduction

Manual agent loops provide maximum control, but they can become difficult to manage as workflows grow in complexity.

Long-running tasks may require:

- Multiple tool calls
- Persistent state
- File system operations
- Network access
- Recovery from interruptions
- Execution over minutes or hours

In these scenarios, running the agent loop on your own infrastructure can become operationally expensive.

Managed agents solve this by moving the agent loop to Anthropic's infrastructure.

## What Is a Managed Agent?

A managed agent is an agent loop that runs entirely on Anthropic's infrastructure rather than your own servers.

Instead of managing:

- While loops
- Tool orchestration
- Session persistence
- Execution environments

you define the agent and start a session.

Anthropic handles the execution.

> **Note:** Managed agents are enabled by default for all API accounts.

## The Four Primitives

Managed agents are built around four core primitives.

### 1. Agent

The agent defines:

- Model
- System prompt
- Toolset
- Persona
- Capabilities

Agents are reusable and can be used across multiple sessions.

### 2. Environment

The environment defines where the agent runs.

Examples include:

- Cloud execution
- Local execution
- Networking configuration
- Runtime settings

The environment provides the sandbox in which work occurs.

### 3. Session

A session is a single execution of an agent inside a specific environment.

A session represents one unit of work.

Examples:

- Reviewing a document
- Organizing files
- Running a research task
- Generating a report

### 4. Events

Events are the communication layer.

Everything flows through events:

- User requests
- Tool usage
- Agent responses
- Status updates

> **Key shift:** Instead of managing a loop, you send and receive events.

## Architecture Overview

The relationship between the primitives looks like this:

```text
Application
      ↓
   Session
      ↓
 Environment
      ↓
 Event Stream
      ↑
    Agent
```

Architecture diagram showing an Agent connected to a Session, which drives an Environment, while events stream back to the application.

## Example: A Simple Line Counter Agent

This example creates a managed agent that:

1. Creates a file.
2. Counts its lines.
3. Reports the result.

The implementation uses Anthropic's built-in agent toolset.

## Step 1: Create the Agent

The first step is defining the reusable agent.

### Example

```python
import anthropic

client = anthropic.Anthropic()

agent = client.beta.agents.create(
    name="Line Counter",
    model="claude-opus-4-8",
    system="You are a helpful agent that completes small file tasks.",
    tools=[
        {"type": "agent_toolset_20260401", "default_config": {"enabled": True}}
    ],
)
```

### What This Defines

| Component | Purpose |
|------------|------------|
| `name` | Human-readable agent name |
| `model` | Claude model used by the agent |
| `system` | Behavioral instructions |
| `tools` | Available toolset |

The bundled agent toolset includes capabilities such as:

- File operations
- Bash execution
- Web access

> **Important:** Agents are reusable and typically created once.

## Step 2: Create the Environment

Next, create the execution environment.

### Example

```python
environment = client.beta.environments.create(
    name="line-counter-env",
    config={
        "type": "cloud",
        "networking": {"type": "unrestricted"},
    },
)
```

### Purpose

The environment provides:

- Containerized execution
- File system access
- Networking configuration
- Runtime isolation

This is where the agent performs its work.

## Step 3: Create the Session

A session connects the agent and environment.

### Example

```python
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=environment.id,
    title="Count lines demo",
)
```

### Purpose

The session represents:

```text
One run of one agent in one environment
```

Multiple sessions can reuse the same agent definition.

## Step 4: Open the Event Stream

Before sending work to the agent, open the event stream.

### Example

```python
with client.beta.sessions.events.stream(session_id=session.id) as stream:
```

> **Important:** Open the stream before sending the initial message.

The stream only receives events that occur after it has been established.

## Step 5: Send the Kickoff Event

Once the stream is open, send the initial user request.

### Example

```python
client.beta.sessions.events.send(
    session_id=session.id,
    events=[
        {
            "type": "user.message",
            "content": [
                {
                    "type": "text",
                    "text": "Create a file in the temp directory, "
                            "count its lines, and report back.",
                }
            ],
        }
    ],
)
```

### Why Events?

The managed-agent API is event-driven.

Events represent:

- User input
- Agent output
- Tool activity
- Session state changes

Everything enters and exits the system through events.

## Step 6: Consume the Event Stream

After sending the request, process incoming events.

### Example

```python
for event in stream:
    if event.type == "agent.message":
        for block in event.content:
            if block.type == "text":
                print(block.text, end="", flush=True)
    elif event.type == "agent.tool_use":
        print(f"\n[tool] {event.name}")
    elif event.type == "session.status_idle":
        print("\n--- Agent done ---")
        break
```

## Important Event Types

### `agent.message`

Contains Claude's text output.

Example:

```python
event.type == "agent.message"
```

### `agent.tool_use`

Indicates that the agent selected and executed a tool.

Example:

```python
event.type == "agent.tool_use"
```

### `session.status_idle`

Signals that the session has completed its work.

Example:

```python
event.type == "session.status_idle"
```

This is the termination signal for the workflow.

## Running the Example

When executed, the workflow proceeds as follows:

1. Agent is created.
2. Environment is created.
3. Session is started.
4. Stream is opened.
5. User request is sent.
6. Agent creates a file.
7. Agent counts the lines.
8. Agent reports the result.
9. Session becomes idle.

Terminal output showing the creation of the agent, environment, and session, followed by tool activity and the final line-count result.

## Managed Agents vs. Manual Loops

### Manual Agent Loop

You manage:

- Loop execution
- Tool orchestration
- Retry behavior
- State persistence
- Infrastructure

### Managed Agents

Anthropic manages:

- Agent loop execution
- Sandboxes
- State handling
- Resumability
- Infrastructure

You focus on:

- Agent configuration
- Event consumption
- Application integration

### Comparison

| Manual Loop | Managed Agent |
|-------------|-------------|
| Full control | Hosted execution |
| Self-managed infrastructure | Anthropic-managed infrastructure |
| Explicit tool orchestration | Automatic orchestration |
| Custom resilience | Built-in resumability |
| More operational overhead | Less operational overhead |

## Production Example: File Share Cleanup

Managed agents are particularly useful for long-running operational tasks.

### Example Workflow

A file-share cleanup agent might:

1. Read a target folder structure.
2. Scan thousands of files.
3. Move files into correct locations.
4. Archive duplicates.
5. Remove empty files.
6. Flag uncertain cases.

The session may run for several minutes while continuously streaming progress updates.

Screenshot showing a file-share cleanup application with a live activity feed as the agent organizes directories and archives files.

### Why Managed Agents Fit

These workflows often require:

- File access
- Long runtimes
- Continuous progress updates
- Recovery from interruptions

Managed agents handle these requirements naturally.

## When to Use Managed Agents

Managed agents are a strong fit when workflows:

- Run for a long time
- Touch many files
- Require persistence
- Need sandboxed execution
- Must survive interruptions
- Benefit from event streaming

## When to Use Manual Loops

Manual loops remain valuable when you need:

- Fine-grained control
- Custom orchestration
- Lightweight execution
- Minimal infrastructure abstraction

Both approaches are valid depending on the use case.

## Key Takeaways

- Managed agents run the agent loop on Anthropic's infrastructure.
- The four primitives are:
  - Agent
  - Environment
  - Session
  - Events
- Agents are reusable definitions containing models, prompts, and tools.
- Environments provide isolated execution sandboxes.
- Sessions represent individual runs.
- Events are the communication mechanism for all activity.
- Open the event stream before sending the kickoff message.
- Watch for:
  - `agent.message`
  - `agent.tool_use`
  - `session.status_idle`
- Managed agents are ideal for long-running, stateful workflows.

## Recap

- Managed agents remove the need to operate your own agent loop infrastructure.
- The workflow is:
  1. Create an agent.
  2. Create an environment.
  3. Create a session.
  4. Open the event stream.
  5. Send events.
  6. Consume events.
- The agent definition is reusable, while sessions represent individual executions.
- Event streams provide real-time visibility into agent activity.
- Use managed agents when workflows become too long-running, stateful, or operationally complex for a manually managed loop.