---
id: claude-platform-101-s3c2
course_name: Claude Platform 101
section: Extending your Agent
chapter: Skills
source_type: course_notes
---

## Introduction

Skills are reusable packages of instructions, resources, and procedures that teach Claude how to perform specialized tasks.

At the core of every Skill is a `SKILL.md` file containing the guidance Claude should follow.

Rather than repeatedly embedding complex instructions into prompts, you can:

1. Package the instructions as a Skill.
2. Upload the Skill once.
3. Reuse it across multiple requests.

Examples include:

- Status report generation
- Review checklists
- Release note formatting
- Team-specific workflows
- Standardized document generation

A Skill teaches Claude a process and a preferred output format.

## What a Skill Does

A Skill provides Claude with a predefined procedure for completing a task.

For example, a status report Skill might define:

- Required sections
- Writing style
- Formatting rules
- How blockers are summarized
- How progress is reported

The user supplies the data, while the Skill supplies the process.

> **Key idea:** Skills teach Claude how your organization performs a task.

## Skills vs. Tools

Skills and tools solve different problems.

### Tools

Tools allow Claude to interact with systems and perform actions.

Examples:

- Looking up information
- Querying databases
- Sending emails
- Executing code

### Skills

Skills teach Claude a workflow or procedure.

Examples:

- Writing a daily status report
- Following a review checklist
- Producing release notes
- Formatting structured summaries

### Comparison

| Tools | Skills |
|--------|--------|
| Connect to data | Teach a procedure |
| Take actions | Just instructions |
| Run code | No code runs |
| Define what Claude can do | Define how you want it done |

Screenshot illustrating the distinction between tools and Skills, highlighting actions versus procedures.

> **Rule of thumb:** Tools determine capabilities. Skills determine methodology.

## Progressive Loading

Skills do not automatically load their entire contents into Claude's context.

Instead, loading occurs in stages.

### Initial Load

At startup, Claude only loads:

- Skill name
- Skill description

### Full Load

When Claude determines a Skill is relevant, it loads the full Skill contents into context.

Benefits include:

- Reduced context usage
- Better scalability
- Faster access to large collections of Skills

> **Note:** Progressive loading allows many Skills to be available without consuming significant context upfront.

## Uploading a Skill

Skills are uploaded once and then referenced by ID in future requests.

### Example

```python
skill = client.beta.skills.create(
    display_title="Status Report Generator",
    files=files_from_dir("status-report-skill"),  # folder containing SKILL.md
)

print(skill.id)
```

### What Happens?

1. A directory containing `SKILL.md` is uploaded.
2. Claude creates a reusable Skill resource.
3. A unique Skill ID is returned.
4. Future requests reference that ID.

The Skill becomes available throughout the workspace.

## Example: Status Report Generator

Imagine a team that wants every status report to follow the same structure.

The Skill contains instructions for:

- Report formatting
- Tone
- Summaries
- Blocker handling
- Section ordering

The activity log itself is supplied dynamically at runtime.

### Input

```text
Activity log
```

### Skill

```text
Rules for creating status reports
```

### Output

```text
Standardized status report
```

The prompt remains simple because the procedure is stored within the Skill.

## Attaching a Skill to a Request

Skills are attached through the `container.skills` configuration.

### Example

```python
response = client.beta.messages.create(
    model="claude-sonnet-4-5",
    max_tokens=4096,
    betas=["skills-2025-10-02", "code-execution-2025-08-25"],
    container={
        "skills": [
            {
                "type": "custom",
                "skill_id": skill.id,
                "version": "latest",
            }
        ]
    },
    tools=[
        {
            "type": "code_execution_20250825",
            "name": "code_execution",
        }
    ],
    messages=[
        {
            "role": "user",
            "content": f"Generate the daily status report from this activity log:\n\n{activity_log}",
        }
    ],
)
```

## Important Components

### Beta Endpoint

Skills currently use the beta API:

```python
client.beta.messages.create(...)
```

Feature access is enabled through:

```python
betas=[...]
```

> **Note:** Skills were a beta feature at the time this lesson was created.

### Container Skills

Skills are attached through:

```python
container={
    "skills": [...]
}
```

This list can contain multiple Skills.

Example:

```python
"skills": [
    skill_a,
    skill_b,
    skill_c
]
```

This allows workflows to combine multiple procedures within a single request.

### Versioning

Each Skill specifies:

```python
{
    "skill_id": "...",
    "version": "latest"
}
```

This enables controlled upgrades and version management.

## Combining Skills and Code Execution

Skills are often paired with code execution.

### Why?

A Skill may describe a process that requires:

- Data transformation
- Analysis
- Calculations
- Script execution

In those cases:

1. The Skill provides the procedure.
2. Code execution performs the computation.

This combination enables sophisticated workflows while keeping the procedural instructions centralized within the Skill.

## Running the Example

When the status report request executes:

1. Claude loads the Skill.
2. The activity log is analyzed.
3. The Skill's instructions are applied.
4. The report is generated using the defined structure.

The resulting report follows the exact format specified in the uploaded `SKILL.md`.

Example sections might include:

- Summary
- Completed work
- In-progress work
- Blockers
- Next steps

Screenshot showing a generated status report with standardized sections and formatting.

## Why Skills Matter in Production

Skills help teams maintain consistency across applications.

Without Skills:

- Instructions must be repeated in prompts.
- Formatting may vary between requests.
- Different developers may implement workflows differently.

With Skills:

- Procedures are centralized.
- Outputs remain consistent.
- Updates occur in one location.
- Teams share common standards.

### Example: Project Management Application

A project-management platform might include a:

```text
Generate report
```

button for every project.

The application sends:

- The project activity log
- The status-report Skill

Claude then generates reports using the same:

- Structure
- Tone
- Formatting
- Ordering

across the entire product.

Screenshot showing a project-management application with a one-click report-generation workflow powered by a Skill.

## Benefits of Skills

| Benefit | Description |
|---------|---------|
| Reusability | Upload once and reuse across requests |
| Consistency | Standardized outputs across teams |
| Reduced prompt complexity | Procedures live in the Skill instead of the prompt |
| Progressive loading | Conserves context window usage |
| Composability | Multiple Skills can be attached to a single request |
| Maintainability | Update the Skill rather than many prompts |

## When to Use Skills

Skills are particularly useful when:

- Output format matters
- Organizational standards exist
- Complex instructions are reused frequently
- Multiple applications require the same workflow
- Consistency is more important than one-off customization

Examples include:

- Reports
- Reviews
- Documentation
- Checklists
- Standard operating procedures

> **Use a Skill when the process itself is valuable knowledge worth packaging and reusing.**

## Key Takeaways

- Skills package reusable procedures into a `SKILL.md` file.
- They teach Claude how tasks should be performed.
- Skills differ from tools:
  - Tools provide capabilities.
  - Skills provide methodology.
- Skills load progressively to reduce context usage.
- Upload Skills once using `client.beta.skills.create`.
- Attach Skills through `container.skills`.
- Multiple Skills can be combined within a single request.
- Skills often work well alongside code execution.

## Recap

- Skills encapsulate organizational workflows and best practices.
- A Skill teaches Claude how to complete a task and structure its output.
- Only a Skill's name and description load initially; full contents load when needed.
- Skills are uploaded once and referenced by ID in future requests.
- The `container.skills` array allows one or more Skills to be attached to a request.
- Skills are especially useful when consistency, formatting, and repeatable procedures are critical.
- Reach for a Skill when the *how* matters just as much as the *what*.