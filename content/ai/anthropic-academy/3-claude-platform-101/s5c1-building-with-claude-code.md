---
id: claude-platform-101-s5c1
course_name: Claude Platform 101
section: Building with Claude Code
chapter: Building with Claude Code
source_type: course_notes
---

## Introduction

Writing Claude API integrations by hand is effective, but it is often faster to have Claude generate the code for you.

Claude Code can:

- Edit files
- Generate code
- Execute commands
- Run tests
- Fix errors automatically

In this lesson, Claude Code is used to complete a TypeScript API integration from a partially implemented file.

## Starting from a Stub

The example project contains a TypeScript file for retrieving weather information.

Two functions are incomplete:

### `getWeather`

Responsible for:

- Accepting a city name
- Returning:
  - Temperature
  - Weather conditions

### `run`

Responsible for:

- Using the Claude TypeScript SDK
- Using the tool runner
- Executing the workflow

The goal is to have Claude Code complete both implementations.

## The Tool Runner

The tool runner simplifies agent development.

Instead of manually implementing:

- Tool-use loops
- `stop_reason` handling
- Tool-result messages

the runner manages those responsibilities automatically.

The resulting workflow becomes:

1. Define tools.
2. Pass tools to the runner.
3. Receive the final result.

This is a common pattern throughout Claude-powered applications.

## The Claude API Skill

Claude Code includes a built-in Skill called **Claude API**.

This Skill helps generate code that follows Claude SDK best practices.

### Automatic Invocation

Claude Code automatically activates the Skill when it detects use of the TypeScript SDK.

### Manual Invocation

You can explicitly invoke the Skill using:

```text
/claude-api
```

## Installing the Skill

If the Skill is not available, install it from the marketplace.

### Command

```text
/plugin marketplace add AnthropicsSkills
```

> **Note:** The package name is `AnthropicsSkills` with a trailing **s**.

Screenshot showing the Claude Code marketplace installation dialog after running the plugin installation command.

## Generating the Integration

Once the project is open in Claude Code, a single prompt can drive the implementation.

A useful prompt specifies three things:

### 1. The File

Tell Claude Code which file should be modified.

Example:

```text
weather.ts
```

### 2. The Pattern

Specify the implementation approach.

Example:

```text
Use the tool runner.
```

### 3. The Desired End State

Describe what the completed program should accomplish.

Example:

```text
Implement weather retrieval and run the workflow.
```

## What Claude Code Does

After receiving the prompt, Claude Code:

1. Reads the project files.
2. Examines available types.
3. Generates the missing code.
4. Executes the program.
5. Reviews any errors.
6. Applies fixes if necessary.
7. Produces working output.

Screenshot showing Claude Code analyzing project files and generating the implementation.

## Example Output

In the demonstrated workflow, Claude Code generated:

### A Tool Definition

The implementation included a Zod-based tool for parsing inputs and validating structure.

### Weather Logic

A completed implementation of:

```typescript
getWeather()
```

that returned weather data based on city input.

### A Tool Runner

Claude Code generated the runner configuration and execution flow.

### The `run()` Function

The workflow entry point was fully implemented.

### Execution Output

The generated code was executed and the final results were displayed.

Screenshot showing generated TypeScript code, including a Zod tool definition and weather-handling logic.

## The Core Pattern

Most Claude API applications follow a familiar structure.

### Step 1: Define a Tool

Create a tool that performs a task.

Example:

```text
Get weather information
```

### Step 2: Pass the Tool to a Runner

The runner manages:

- Tool invocation
- Agent loops
- Result handling

### Step 3: Return the Result

The final response is returned to the user or application.

### Pattern Summary

```text
Define a tool
        ↓
Pass it to a runner
        ↓
Return the result
```

This pattern appears repeatedly across Claude SDK integrations.

## Why Use Claude Code?

Instead of manually writing repetitive integration code:

1. Create a stub.
2. Describe the desired implementation.
3. Let Claude Code generate the solution.
4. Review the resulting diff.

Benefits include:

- Faster development
- Reduced boilerplate
- Automatic error correction
- Consistent SDK usage
- Better adherence to established patterns

> **Best practice:** Let Claude Code generate the scaffolding and integration logic, then review and validate the generated changes.

## Typical Workflow

A common Claude Code workflow looks like:

1. Create a file with stubs.
2. Open the project in Claude Code.
3. Provide a clear prompt.
4. Allow Claude Code to implement the solution.
5. Review the generated diff.
6. Run tests or validation.
7. Commit the final version.

## Key Takeaways

- Claude Code can generate Claude API integrations directly inside your development environment.
- The built-in Claude API Skill helps generate SDK-compliant TypeScript implementations.
- The Skill loads automatically when the TypeScript SDK is detected.
- It can also be invoked manually using:

```text
/claude-api
```

- If necessary, install the Skill through:

```text
/plugin marketplace add AnthropicsSkills
```

- Effective prompts specify:
  - The file to modify
  - The implementation pattern
  - The desired outcome
- Claude Code can write code, execute it, diagnose errors, and apply fixes automatically.
- Most Claude API integrations follow the pattern:
  - Define a tool
  - Pass it to a runner
  - Return the result

## Recap

- Claude Code acts as an agent within your terminal that can edit files and execute commands.
- The Claude API Skill streamlines generation of TypeScript SDK integrations.
- A well-structured prompt allows Claude Code to implement, run, and refine code automatically.
- Tool-runner-based applications typically follow a simple structure: define a tool, hand it to a runner, and return the result.
- Rather than writing every integration from scratch, create a stub, delegate the implementation, and review the generated diff.