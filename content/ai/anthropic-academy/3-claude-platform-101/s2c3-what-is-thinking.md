---
id: claude-platform-101-s2c3
course_name: Claude Platform 101
section: Teaching your Agent
chapter: What is thinking?
source_type: course_notes
---

## Introduction

Some problems require more than an immediate response.

Tasks involving reasoning, trade-offs, debugging, or multi-step analysis often benefit from allowing Claude additional time to think before generating an answer.

This capability is called **extended thinking**.

## Why Thinking Matters

A common failure mode occurs when a model is asked a complex, multi-step question and responds immediately.

Without sufficient reasoning, the model may:

- Skip intermediate steps
- Miss important constraints
- Produce confident but incorrect answers

Diagram illustrating a model responding immediately to a multi-step problem and producing an incorrect answer.

Extended thinking helps reduce these errors by giving Claude space to reason through a problem before responding.

## What Is Extended Thinking?

Extended thinking allows Claude to perform step-by-step reasoning before generating its final answer.

When enabled, Claude:

1. Analyzes the problem.
2. Generates internal reasoning tokens.
3. Evaluates intermediate conclusions.
4. Produces a final response.

The reasoning process is often referred to as a **chain of thought**.

### Visible Reasoning

Unlike hidden internal processing, extended thinking exposes the reasoning process in the API response.

Responses may contain:

- Thinking blocks
- Tool-use blocks
- Final text blocks

This allows developers to inspect how Claude arrived at its conclusion.

## Adaptive Thinking in Opus 4.7

With Claude Opus 4.7, thinking is adaptive.

Instead of specifying a token budget, you simply enable thinking and allow Claude to determine:

- Whether additional reasoning is needed
- How much reasoning is required

### Enabling Adaptive Thinking

```python
thinking={"type": "adaptive"}
```

Claude dynamically allocates reasoning effort based on the complexity of the task.

## Controlling Thinking Depth

The amount of reasoning Claude performs can be adjusted using the `effort` parameter.

> **Important:** `effort` belongs inside `output_config`, not inside the `thinking` block.

### Example

```python
output_config={"effort": "high"}
```

### Available Effort Levels

| Level | Description |
|---------|---------|
| `low` | Minimal reasoning |
| `medium` | Moderate reasoning |
| `high` | Deep reasoning (default) |
| `xhigh` | Extra-deep reasoning |
| `max` | Maximum available reasoning effort |

## When to Use Extended Thinking

Extended thinking is most useful when tasks require multiple reasoning steps or involve trade-offs.

### Recommended Use Cases

- Mathematics
- Multi-step logic problems
- Code debugging
- Regulatory analysis
- Strategic decision-making
- Comparing multiple options
- Planning tasks with constraints

Slide illustrating common extended-thinking use cases including math, logic, debugging, regulatory analysis, and complex comparisons.

### When to Skip It

Extended thinking is often unnecessary for simple tasks such as:

- Classification
- Extraction
- Routing
- Boilerplate generation
- Straightforward transformations

In these situations, thinking may:

- Increase latency
- Consume additional tokens
- Increase cost
- Provide little or no quality improvement

> **Rule of thumb:** Use thinking for difficult reasoning problems, not routine processing tasks.

## Thinking in Action

Consider an agent that must plan a road trip while balancing:

- Weather conditions
- Travel time
- Multiple destination options

This is a trade-off-heavy problem that benefits from reasoning.

### Example

```python
import anthropic

client = anthropic.Anthropic()

weather_tool = {
    "name": "get_weather",
    "description": "Get the current weather for a city.",
    "input_schema": {
        "type": "object",
        "properties": {
            "city": {"type": "string", "description": "City name"}
        },
        "required": ["city"],
    },
}

response = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    thinking={"type": "adaptive"},
    output_config={"effort": "high"},  # low | medium | high | xhigh | max
    tools=[weather_tool],
    messages=[
        {
            "role": "user",
            "content": "Plan a road trip out of San Francisco with two stops, "
                       "weighing weather and drive time.",
        }
    ],
)
```

## What Happens During Execution?

When the request runs, the response typically contains several stages.

### 1. Thinking Blocks

Claude reasons through:

- Potential destinations
- Weather considerations
- Drive-time constraints
- Trade-offs between options

### 2. Tool Calls

Claude requests weather information through:

```text
get_weather
```

for relevant cities.

### 3. Final Recommendation

After evaluating available information, Claude produces a final travel plan.

The resulting response includes both:

- The reasoning process
- The final recommendation

> **Key benefit:** Developers can inspect how Claude evaluated trade-offs before reaching a conclusion.

## Why Thinking Matters in Production

Extended thinking becomes particularly valuable in applications that require reasoning across multiple sources of information.

### Example: Compliance Review

A compliance-review agent may need to:

1. Read multiple report sections.
2. Compare specifications.
3. Identify inconsistencies.
4. Determine whether requirements conflict.

Without extended thinking, the agent may only evaluate findings independently.

With adaptive thinking enabled, the agent can reason across the entire document.

### Example Outcome

The agent may identify that:

- A wind-load specification in one section
- Conflicts with a material specification elsewhere

This type of cross-reference often requires deeper reasoning than simple extraction.

Screenshot showing a compliance-review application with a "Thorough review" option enabled and findings linked across multiple report sections.

## Benefits of Extended Thinking

| Benefit | Description |
|---------|---------|
| Better reasoning | Improves performance on complex tasks |
| Multi-step analysis | Handles problems requiring several intermediate steps |
| Trade-off evaluation | Weighs competing options and constraints |
| Transparency | Makes reasoning visible through thinking blocks |
| Better agent behavior | Helps agents connect information across sources |

## Trade-Offs

Extended thinking is powerful but comes with costs.

### Advantages

- Improved reasoning quality
- Better handling of complex tasks
- Stronger decision-making
- More robust analysis

### Costs

- Higher latency
- Greater token usage
- Increased API cost

Because of these trade-offs, thinking should be enabled selectively.

## Key Takeaways

- Extended thinking allows Claude to reason before producing an answer.
- The reasoning process is visible within the API response.
- Opus 4.7 supports adaptive thinking through:

```python
thinking={"type": "adaptive"}
```

- Reasoning depth is controlled through:

```python
output_config={"effort": "..."}
```

- Available effort levels are:
  - `low`
  - `medium`
  - `high`
  - `xhigh`
  - `max`
- Thinking is most valuable for complex reasoning and trade-off-heavy tasks.
- For simple workflows, thinking often increases cost and latency without improving results.

## Recap

- Extended thinking gives Claude additional room to reason before responding.
- Adaptive thinking automatically determines how much reasoning a task requires.
- The `effort` parameter controls the depth of reasoning and belongs inside `output_config`.
- Thinking is best used for complex analysis, planning, debugging, and decision-making tasks.
- Simple classification and extraction workloads typically do not benefit from additional reasoning.