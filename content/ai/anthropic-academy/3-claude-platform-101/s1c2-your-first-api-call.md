---
id: claude-platform-101-s1c2
course_name: Claude Platform 101
section: What is the Claude Developer Platform?
chapter: Your first API call
source_type: course_notes
---

## Introduction

A simple greeting to Claude demonstrates connectivity, but real applications require structured inputs and useful outputs. In this lesson, you'll make your first API call and use Claude to review a piece of buggy code.

## Get Set Up

Before making API requests, create an API key in the Claude Console at `platform.claude.com`.

> **Note:** API credits must be purchased before the key can be used.

Screenshot showing a newly created API key with a copy button and a warning that the key will not be viewable again.

### Store Your API Key Securely

Save the API key in a `.env.local` file rather than hardcoding it in source code.

> **Warning:** Hardcoding API keys can expose them through version control systems such as GitHub. Use environment variables to keep secrets secure.

### Install the SDK

```bash
npm install @anthropic-ai/sdk
```

## The Anatomy of a Request

Every API call uses the `messages.create` method.

A request requires three core components:

1. A model
2. A maximum token limit
3. A list of messages

### Core Parameters

| Parameter | Purpose |
|------------|------------|
| `model` | Specifies which Claude model handles the request. |
| `max_tokens` | Sets the maximum length of the response. |
| `messages` | Provides conversation input as a list of message objects with roles such as `user` or `assistant`. |

### Basic Example

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const msg = await client.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 1024,
  messages: [{
    role: "user",
    content: "Hello, Claude",
  }],
});
```

## Example: Reviewing Buggy Code

A more practical use case is asking Claude to review code and identify issues.

### Full Example

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const buggyCode = `
function add(a, b) {
  return a - b;
}
`;

const response = await client.messages.create({
  model: "claude-opus-4-8",
  max_tokens: 1024,
  system: "You are a terse senior code reviewer. Give feedback in one paragraph.",
  messages: [
    { role: "user", content: `Review this code:\n${buggyCode}` },
  ],
});

for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text);
  }
}
```

## Understanding the Request

### Using a System Prompt

The `system` prompt controls Claude's behavior and role.

In this example:

```text
You are a terse senior code reviewer. Give feedback in one paragraph.
```

This instruction influences Claude's response style, making it concise and focused rather than conversational.

### Passing User Input

The buggy code is embedded into the user message:

```javascript
{
  role: "user",
  content: `Review this code:\n${buggyCode}`
}
```

This pattern allows applications to dynamically pass content from users, databases, files, or other systems.

## Understanding the Response

One important detail is that `response.content` is not a single string.

Instead, it is an array of content blocks.

### Processing Response Blocks

```javascript
for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text);
  }
}
```

Each block may represent different content types, including:

- Text
- Tool calls
- Thinking blocks
- Other structured outputs

For simple text responses there is often only one text block, but applications should always iterate through the array and check each block's type.

> **Note:** Treating the response as a collection of blocks makes applications compatible with more advanced Claude capabilities.

### Expected Result

When run, Claude identifies that the function named `add` is incorrectly performing subtraction:

```javascript
function add(a, b) {
  return a - b;
}
```

It suggests replacing:

```javascript
return a - b;
```

with:

```javascript
return a + b;
```

Screenshot showing terminal output where Claude explains that the function performs subtraction despite being named `add`.

## From Script to Product

The same `messages.create` pattern scales from simple scripts to production applications.

For example, a meeting-summary feature might:

1. Retrieve a transcript from a database.
2. Send it to Claude with a system prompt such as:
   - "Extract insights and risks."
3. Receive the generated summary.
4. Store the result.
5. Return it to the user interface.

The core API call remains the same; it is simply wrapped inside application logic such as route handlers, services, or background jobs.

Screenshot showing a meetings dashboard with recorded meetings and a "Generate summary" button powered by Claude.

## Key Takeaways

- Every Claude API request uses `messages.create`.
- A request requires:
  - A model
  - A token limit
  - A list of messages
- Store API keys in `.env.local` files instead of source code.
- Use the `system` prompt to define Claude's role and behavior.
- Response content is returned as an array of blocks rather than a single string.
- Applications should iterate through response blocks and check each block's type.
- The same request pattern powers both simple scripts and full production features.

## Recap

- Your first API call is built with `messages.create`, a model, a token limit, and one or more messages.
- API keys should be stored securely in environment files.
- System prompts shape Claude's behavior and response style.
- Responses are returned as structured content blocks that should be processed by type.
- Nearly every Claude-powered product feature builds on this same request pattern.