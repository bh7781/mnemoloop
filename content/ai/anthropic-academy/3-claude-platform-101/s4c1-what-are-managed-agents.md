---
id: claude-platform-101-s4c1
course_name: Claude Platform 101
section: Managed Agents
chapter: What are managed agents?
source_type: course_notes
---

## Introduction

Claude Managed Agents is a suite of APIs for building and deploying agents at scale.

Developers define:

- Agent capabilities
- Available tools
- Personas
- Execution environments
- Success criteria

Anthropic then hosts and operates the agent infrastructure.

Managed agents run inside isolated environments with capabilities such as:

- File system access
- Bash execution
- Web search
- Tool use
- Memory
- Multi-agent coordination

The result is a fully managed agent platform that can be integrated directly into applications.

## The Agent Loop, Hosted for You

At their core, managed agents operate using the same agent loop found in custom agent implementations.

### Traditional Agent Loop

1. Claude reasons about the task.
2. Claude requests a tool.
3. The tool executes.
4. Claude reads the result.
5. Claude decides what to do next.
6. The process repeats until completion.

### Managed Agent Loop

Managed agents run this same loop on Anthropic's infrastructure.

Instead of maintaining:

- Agent servers
- Tool orchestration
- Execution environments
- Session management

developers focus on defining the agent while Anthropic handles execution.

> **Key idea:** Managed agents host the entire agent loop for you.

## Core Components

Managed agents are built from several foundational concepts.

### Agents

Agents define:

- Available tools
- Personas
- Capabilities
- Behavioral constraints

They represent reusable agent configurations.

### Sessions

A session is a single execution of an agent.

Examples:

- Processing a support ticket
- Generating a report
- Responding to an incident
- Completing a development task

Multiple sessions can run simultaneously.

### Environments

Environments are isolated execution sandboxes.

They define:

- Installed packages
- Runtime configuration
- Network access controls
- Available resources

### Tools

Agents can use:

- Built-in tools
- Custom tools
- MCP-connected services

### Memory

Memory enables persistence between sessions.

Agents can:

- Read prior findings
- Store new information
- Build long-term context

### Outcomes

Outcomes define success criteria through:

- Rubrics
- Graders
- Evaluation systems

These mechanisms determine whether work is complete.

### Multi-Agent Coordination

Complex tasks can be delegated across multiple specialized agents.

A coordinator agent can:

1. Assign work.
2. Gather results.
3. Synthesize final outputs.

## Example 1: A Kanban Board That Does the Work

Imagine a development workflow built on top of managed agents.

### Workflow

A developer drags a task into:

```text
In Progress
```

This action automatically starts a new agent session.

### Example Task

```text
Optimize website performance
```

### Environment Configuration

The session launches in an environment containing:

- Lighthouse
- Puppeteer
- Project dependencies

The application's GitHub repository is mounted into the container.

Claude now has access to:

- The codebase
- Development tools
- Performance metrics
- Completion criteria

### Success Criteria

The rubric might require:

- Lighthouse score above 90
- No render-blocking resources
- Lazy loading for all images

### Execution Process

Claude:

1. Runs performance audits.
2. Identifies bottlenecks.
3. Compresses images.
4. Defers scripts.
5. Optimizes CSS.
6. Re-runs evaluations.

### Grader Feedback Loop

A separate grading system evaluates the output.

The grader operates in its own context window and determines whether the work satisfies the rubric.

If requirements are not met:

1. Feedback is generated.
2. Claude receives the feedback.
3. Additional improvements are made.
4. The work is re-evaluated.

In the example workflow, the Lighthouse score improves to 96.

### Parallel Sessions

Multiple tickets can be processed simultaneously.

Each session receives:

- Its own container
- Its own execution state
- Its own agent loop

Screenshot showing a Kanban board with multiple tickets running in parallel, each streaming tool activity.

## Example 2: A Recurring Research Agent with Memory

Another common pattern is a recurring research workflow.

### Scenario

An organization wants weekly reporting on SaaS pricing changes.

The report should be available before the team's stand-up meeting.

### Agent Responsibilities

On each run, the agent:

1. Searches vendor pricing pages.
2. Identifies plan changes.
3. Detects new features.
4. Performs cost analysis.
5. Generates reports.
6. Distributes results.

### Execution Workflow

The agent:

- Uses web search to collect current pricing information.
- Runs Python analysis inside the sandbox.
- Uses an Excel-reporting Skill.
- Generates an executive summary.
- Posts updates to Slack.
- Creates review tasks in Asana.

MCP servers provide the integrations to external services.

### Memory Integration

Before starting:

1. The agent reads previous findings.

After completion:

1. The agent stores new findings.

This enables longitudinal analysis.

Example:

```text
Compute costs are 15% lower than last week.
```

instead of repeatedly reporting static pricing information.

Screenshot showing a memory panel containing findings and historical pricing information.

## Example 3: Incident Response with Multiple Agents

Managed agents also support complex operational workflows.

### Scenario

A monitoring system detects:

```text
API latency spike
```

A custom tool forwards the alert payload into a new agent session.

### Multi-Agent Workflow

A coordinator agent receives the alert.

The coordinator delegates work to specialists.

Example specialists:

- Diagnostics specialist
- Log-analysis specialist
- Communications specialist

Each specialist:

- Operates independently
- Uses its own context window
- Shares access to a common file system

### Synthesis

After analysis:

1. Specialists return findings.
2. The coordinator combines results.
3. A unified incident summary is generated.

Screenshot showing an incident-response dashboard with specialist agents investigating an alert.

### Human Approval

Some actions may require explicit approval.

Example:

```text
Send incident update to Slack
```

Before execution:

1. Claude drafts the message.
2. A human reviews it.
3. Approval is granted.
4. The action executes.

This pattern is enforced through permissions policies.

### Memory-Aware Incident Response

The coordinator can query memory for historical incidents.

Example:

```text
This resembles the DNS TTL issue from two weeks ago.
```

Instead of starting from scratch, the agent begins with prior context.

This improves:

- Investigation speed
- Diagnostic quality
- Organizational learning

## Building Blocks of Managed Agents

The examples above combine several managed-agent capabilities.

| Component | Purpose |
|------------|------------|
| Agents | Define tools, personas, and capabilities |
| Sessions | Individual agent executions |
| Environments | Isolated execution sandboxes |
| Tools | Access external functionality |
| MCP | Connect to external services |
| Memory | Persist information across sessions |
| Outcomes | Define and evaluate success criteria |
| Multi-agent coordination | Delegate work across specialists |

## Benefits of Managed Agents

| Benefit | Description |
|---------|---------|
| Hosted infrastructure | Anthropic manages execution environments |
| Stateful workflows | Memory persists information across sessions |
| Parallel execution | Multiple sessions run simultaneously |
| Built-in evaluation | Rubrics and graders verify outcomes |
| Service integrations | MCP enables access to external platforms |
| Multi-agent systems | Specialists collaborate on complex tasks |
| Human oversight | Permissions policies support approval workflows |

## Key Takeaways

- Claude Managed Agents is a hosted platform for building and deploying agents at scale.
- Managed agents execute the standard agent loop on Anthropic's infrastructure.
- Agents run inside isolated environments with file system access, bash execution, and web-search capabilities.
- Sessions represent individual agent runs and can operate in parallel.
- Outcomes use rubrics and graders to evaluate whether work is complete.
- Memory allows agents to retain knowledge across sessions.
- MCP provides integrations with external systems such as Slack and Asana.
- Multi-agent coordination enables specialist agents to collaborate on larger tasks.
- Permissions policies allow sensitive actions to require human approval.

## Recap

- Managed agents host the entire agent lifecycle, removing the need to operate agent infrastructure yourself.
- Agents are defined through tools, personas, capabilities, environments, and outcomes.
- Sessions execute independently and can stream activity back to your application in real time.
- Graders and rubrics establish objective definitions of success and enable iterative improvement.
- Memory, MCP, custom tools, permissions controls, and multi-agent coordination create a complete stateful-agent platform.
- Developers define what success looks like; Claude works toward that goal within the managed environment.