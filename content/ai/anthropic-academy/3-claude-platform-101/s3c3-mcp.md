---
id: claude-platform-101-s3c3
course_name: Claude Platform 101
section: Extending your Agent
chapter: MCP
source_type: course_notes
---

## Introduction

As agents become more capable, they often need access to third-party services such as:

- Asana
- Slack
- Google Calendar
- Linear
- GitHub

Traditional integrations require developers to write and maintain custom API wrappers for each service.

The Model Context Protocol (MCP) addresses this problem by shifting integration maintenance from application developers to service providers.

## The Maintenance Problem

Imagine an agent that needs to:

1. Retrieve tasks from Asana.
2. Check a Google Calendar.
3. Search Slack conversations.

With custom tools, you would need to:

- Build three integrations.
- Handle authentication.
- Maintain API clients.
- Update code whenever those APIs change.

While building the integrations is manageable, maintaining them over time becomes increasingly expensive.

### The Challenge

Third-party APIs change frequently:

- New endpoints
- Updated schemas
- Authentication changes
- Deprecations

Without MCP, developers become responsible for maintaining a growing collection of API wrappers.

## What MCP Solves

MCP shifts integration ownership to the service provider.

Instead of developers maintaining integrations:

- Asana publishes an MCP server.
- Slack publishes an MCP server.
- Google publishes an MCP server.

Each server exposes:

- Tool definitions
- Input schemas
- Descriptions
- Authentication requirements

When the provider updates its API, it updates the MCP server.

Your application remains unchanged.

> **Key idea:** The service provider maintains the integration, not you.

## Tools vs. Skills vs. MCP

Although these features may appear similar, they solve different problems.

### Tools

Tools connect Claude to systems that you own.

Examples:

- Internal databases
- Proprietary APIs
- Internal services
- Custom business logic

You maintain both the integration and the underlying system.

### Skills

Skills teach Claude a process or workflow.

Examples:

- Status report generation
- Review procedures
- Release-note formatting
- Team-specific standards

Skills are instructional rather than integrational.

### MCP

MCP connects Claude to third-party systems through provider-maintained integrations.

Examples:

- Slack
- Asana
- Linear
- GitHub
- Other external platforms

The provider maintains the integration layer.

### Comparison

| Feature | Purpose | Maintenance Owner |
|----------|----------|----------|
| Tools | Connect Claude to your systems | You |
| Skills | Teach Claude procedures and workflows | You |
| MCP | Connect Claude to third-party services | Service provider |

Screenshot comparing Tools, Skills, and MCP, highlighting MCP as the mechanism for provider-maintained integrations.

> **Simple rule:** Tools are for your data, Skills are for your processes, and MCP is for everyone else's systems.

## Connecting to an MCP Server

The easiest way to understand MCP is to connect Claude to an existing MCP server and let Claude discover the available tools.

### Example: Linear MCP Server

In this example:

- The connection details are provided through `mcp_servers`.
- Tool access is granted through `mcp_toolset`.
- Authentication is supplied through an environment variable.

### Full Example

```python
import os
import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-opus-4-8",
    max_tokens=1000,
    messages=[
        {"role": "user", "content": "What tools do you have available?"}
    ],
    mcp_servers=[
        {
            "type": "url",
            "url": "https://mcp.linear.app/mcp",
            "name": "linear",
            "authorization_token": os.environ["LINEAR_MCP_TOKEN"],
        }
    ],
    tools=[
        {
            "type": "mcp_toolset",
            "mcp_server_name": "linear",
        }
    ],
    betas=["mcp-client-2025-11-20"],
)

print(response)
```

## Understanding the Components

### `mcp_servers`

This section defines the connection.

Example:

```python
mcp_servers=[
    {
        "type": "url",
        "url": "...",
        "name": "linear",
        "authorization_token": "..."
    }
]
```

Common fields include:

| Field | Purpose |
|---------|---------|
| `type` | Connection type |
| `url` | MCP server endpoint |
| `name` | Friendly server identifier |
| `authorization_token` | Optional authentication token |

### `mcp_toolset`

This section determines which tools Claude can access from the MCP server.

Example:

```python
{
    "type": "mcp_toolset",
    "mcp_server_name": "linear",
}
```

By default, Claude receives access to all available tools exposed by the server.

## Automatic Tool Discovery

One of MCP's biggest advantages is automatic tool discovery.

With custom tools, developers must provide:

- Tool names
- Descriptions
- Schemas

With MCP:

1. Claude connects to the server.
2. The server advertises available tools.
3. Claude reads the schemas automatically.
4. Claude chooses appropriate tools for the task.

No custom tool definitions are required.

> **Benefit:** Developers do not need to write or maintain tool schemas for supported services.

## Running the Example

When connected to the Linear MCP server:

1. Claude discovers available Linear tools.
2. Claude explains which tools are available.
3. Claude may select and invoke one based on the prompt.

Screenshot showing Claude listing discovered Linear tools and selecting an appropriate one to use.

At no point does the application define:

- Tool schemas
- API clients
- Request handlers

Those responsibilities remain with Linear.

## Restricting Tool Access

Many MCP servers expose numerous tools.

In production, it is often desirable to limit what Claude can access.

Reasons include:

- Preventing write operations
- Reducing context usage
- Limiting risk
- Simplifying tool selection

## Example: Read-Only Slack Access

The recommended pattern is:

1. Disable all tools.
2. Explicitly enable only the required ones.

### Example

```python
tools=[
    {
        "type": "mcp_toolset",
        "mcp_server_name": "slack",
        "default_config": {
            "enabled": False,
        },
        "configs": {
            "search_messages": {"enabled": True},
            "list_channels": {"enabled": True},
        },
    }
]
```

### Result

Claude can:

- Search messages
- List channels

Claude cannot:

- Post messages
- Delete content
- Perform other actions that remain disabled

This creates a safer, more predictable environment.

> **Best practice:** Start with all MCP tools disabled and selectively enable only the capabilities required by the workflow.

## MCP in Production

MCP is particularly valuable when integrating with many external platforms.

Benefits include:

- Less integration code
- Reduced maintenance burden
- Faster development
- Consistent tool interfaces
- Automatic compatibility with API changes

### Example Use Cases

| Use Case | MCP Service |
|----------|----------|
| Project management | Linear, Asana |
| Team communication | Slack |
| Scheduling | Google Calendar |
| Source control | GitHub |
| Knowledge management | Provider-specific MCP servers |

Instead of maintaining each integration yourself, you connect to the provider's MCP server.

## Beta Status

At the time of this lesson, MCP support is a beta feature.

Requests must include the appropriate beta header.

Example:

```python
betas=["mcp-client-2025-11-20"]
```

> **Note:** Beta features may evolve over time as the protocol and tooling mature.

## Benefits of MCP

| Benefit | Description |
|---------|---------|
| Reduced maintenance | Providers maintain integrations |
| Automatic tool discovery | No schemas to write |
| Faster onboarding | Connect to existing services quickly |
| Consistent architecture | Common interface across services |
| Access control | Fine-grained tool enablement and restriction |

## Key Takeaways

- MCP allows Claude to connect to provider-maintained third-party integrations.
- Service providers update their own MCP servers when APIs change.
- Tools, Skills, and MCP serve different purposes:
  - Tools connect to your systems.
  - Skills teach your processes.
  - MCP connects to external services.
- MCP connections are defined through `mcp_servers`.
- Tool access is controlled through `mcp_toolset`.
- Claude automatically discovers available tools and schemas from the server.
- Access can be restricted by disabling tools by default and selectively enabling only the required ones.
- MCP support is currently available through a beta feature flag.

## Recap

- MCP exists to eliminate the need to maintain third-party integrations yourself.
- Service providers publish MCP servers that expose tools through a standard protocol.
- Claude discovers and uses those tools automatically.
- Use Tools for your systems, Skills for your workflows, and MCP for external platforms.
- Restrict tool access whenever possible to improve safety and reduce unnecessary complexity.
- Learn more about the protocol and available servers at `modelcontextprotocol.io`.