---
id: claude-platform-101-s1c1
course_name: Claude Platform 101
section: What is the Claude Developer Platform?
chapter: What is the Claude Developer Platform?
source_type: course_notes
---

## Introduction

The Claude Developer Platform is Anthropic's infrastructure for building with Claude programmatically. Instead of chatting with Claude in a browser, developers send structured requests from their applications and receive structured responses in return.

The platform provides fine-grained control over:

- Which model to use
- How many tokens to spend
- What tools Claude can access
- Which system instructions Claude follows

## Platform Components

The Claude Developer Platform consists of:

- A REST API that can be called from any programming language
- SDKs for multiple programming languages
- Command-line interfaces (CLIs)
- A console for:
  - Managing API keys
  - Monitoring usage
  - Deploying managed agents
  - Testing prompts

## The Three Layers of the Platform

A useful way to think about the Claude Developer Platform is as three layers stacked on top of each other.

### Primitives

Primitives are the API building blocks designed specifically for Claude.

They include:

- Messages API
- Tool use
- Files
- Web search
- Code execution
- MCP servers
- Skills

These are the capabilities developers directly call from their code.

### Infrastructure

Infrastructure provides the systems needed to move from a prototype to a production-scale agentic application.

Examples include:

- Managed agents
- Retries
- Queues
- Observability
- Prompt caching
- Memory

These services provide the underlying reliability and scalability required for larger workloads.

### Controls

Controls are the operational tools used once applications are running in production.

Examples include:

- Dashboards
- Evaluations (evals)
- Workspaces
- Usage limits
- Spend limits
- Request logs

These tools help teams monitor, evaluate, and manage deployed systems.

> **Note:** The Claude Console reflects this structure, providing interfaces for building, managing agents, and analyzing usage.

### Layer Summary

| Layer | Purpose | Examples |
|---------|---------|---------|
| Primitives | Core Claude building blocks | Messages API, tool use, files, web search, code execution, MCP servers, skills |
| Infrastructure | Scaling and operational reliability | Managed agents, retries, queues, observability, prompt caching, memory |
| Controls | Production management and monitoring | Dashboards, evaluations, workspaces, usage limits, spend limits, request logs |

> **Key takeaway:** Build with primitives, scale on infrastructure, run with control.

## Example: Drafting Help Desk Replies

Consider a help desk application that needs a feature to draft responses based on support tickets while following company tone and guidelines.

Image illustrating a help desk application with a "Draft reply with Claude" button.

### Workflow

The implementation flow is straightforward:

1. Define a client.
2. Retrieve the support ticket content.
3. Call `messages.create`.
4. Return the generated response to the user interface.

### Example Code

```python
client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-haiku-4-5",
    max_tokens=1024,
    system=TONE_AND_GUIDELINES,
    messages=[
        {"role": "user", "content": ticket_content}
    ],
)

draft = response.content
```

### Understanding the Parameters

| Parameter | Purpose |
|------------|------------|
| `model` | Specifies which Claude model handles the request. In this example, Haiku is appropriate for a straightforward drafting task. |
| `max_tokens` | Limits the maximum length of Claude's response. |
| `system` | Defines Claude's role and behavior, including company tone and guidelines. |
| `messages` | Contains the conversation inputs. Here, the support ticket content is provided as user input. |

After the response is generated, the application can display it in the reply interface for review and editing before sending.

Image illustrating a populated draft response with options to discard, edit, or send.

## From Asking Questions to Building Products

A key distinction of the Claude Developer Platform is that it enables developers to integrate Claude into existing products and workflows.

Rather than building a standalone chatbot, developers can:

- Add AI-powered features to current applications
- Automate specific tasks
- Embed Claude into business workflows
- Create agentic systems that operate within products

The API acts as the connection between Claude's capabilities and the application's user experience.

## Managed Agents

As applications grow more sophisticated, developers may need agents that can operate over longer workflows.

The platform provides managed agents, allowing Anthropic's infrastructure to run and manage agents on behalf of developers.

This means the platform supplies not only access to Claude models, but also the operational systems required to run agent-based applications.

## Recap

- The Claude Developer Platform is Anthropic's infrastructure for building with Claude programmatically through APIs, SDKs, CLIs, and the Claude Console.
- The platform can be understood as three layers:
  - **Primitives** for building
  - **Infrastructure** for scaling
  - **Controls** for operating in production
- The shorthand is:
  - **Build with primitives**
  - **Scale on infrastructure**
  - **Run with control**
- A single `messages.create` call gives developers control over:
  - Model selection
  - Response length
  - System instructions
  - User input
- The platform enables Claude to become part of an application or product rather than remaining a standalone chat interface.
- Managed agents allow the platform to run agentic workflows on behalf of developers.