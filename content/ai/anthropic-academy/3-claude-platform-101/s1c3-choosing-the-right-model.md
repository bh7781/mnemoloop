---
id: claude-platform-101-s1c3
course_name: Claude Platform 101
section: What is the Claude Developer Platform?
chapter: Choosing the right model
source_type: course_notes
---

## Introduction

Choosing the right Claude model is an important trade-off between capability, speed, and cost.

Using the most capable model for every request can unnecessarily increase API costs, while choosing the cheapest model may reduce output quality. The goal is to select the least expensive model that consistently produces results you would be comfortable shipping.

## Claude Model Tiers

Anthropic offers multiple model tiers, each optimized for different types of work.

### Claude Fable

Claude Fable is Anthropic's most capable model tier.

Characteristics:

- Highest capability
- Built for the most difficult tasks
- Significantly more expensive than Opus
- Best reserved for problems where maximum capability is worth the additional cost

> **Note:** At the time this course was created, Claude Fable was not generally available and was not included in the accompanying video content.

### Claude Opus

Claude Opus is the most capable of the core model families.

Characteristics:

- Highest intelligence among the core tiers
- Slowest response times
- Highest cost among the core tiers

Best suited for:

- Deep reasoning
- Complex analysis
- Multi-step coding
- Nuanced writing

### Claude Sonnet

Claude Sonnet provides a balance between capability, speed, and cost.

Characteristics:

- Strong reasoning ability
- Fast performance
- Moderate cost

Best suited for:

- Most production workloads
- General-purpose AI features
- Applications requiring a balance of quality and efficiency

### Claude Haiku

Claude Haiku is optimized for speed and cost efficiency.

Characteristics:

- Fastest response times
- Lowest cost
- Designed for high-volume workloads

Best suited for:

- Classification
- Extraction
- Routing
- Simple transformations
- Large-scale automation

## Model Comparison

| Model | Capability | Speed | Cost | Best For |
|---------|---------|---------|---------|---------|
| Claude Fable | Highest | Lowest | Highest | Extremely challenging tasks requiring maximum capability |
| Claude Opus | Very high | Slower | High | Deep reasoning, analysis, complex coding, nuanced writing |
| Claude Sonnet | High | Fast | Moderate | Most production applications |
| Claude Haiku | Good | Fastest | Lowest | Classification, extraction, routing, high-volume tasks |

## Start With a Simple Evaluation

Before building a production feature, create a small evaluation dataset.

A useful starting point is:

- 20–30 representative examples
- Real inputs from your expected workload
- Clear criteria for what constitutes a good output

The goal is to compare models against actual business requirements rather than assumptions.

### Recommended Evaluation Process

1. Run the examples through Haiku.
2. Review the outputs.
3. If quality is sufficient, use Haiku.
4. If quality is insufficient, test Sonnet.
5. Move to Opus only when necessary.
6. Consider Fable only when the task genuinely requires the highest available capability.

> **Key takeaway:** Start with the least expensive model and move up only when quality requirements demand it.

## Comparing Models Side by Side

A simple way to evaluate models is to run the same prompt through multiple tiers and compare the results.

### Example

```python
models = ["claude-haiku-4-5", "claude-sonnet-4-6", "claude-opus-4-7"]

for model in models:
    response = client.messages.create(
        model=model,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    print(model, response.usage)
```

### What This Example Demonstrates

#### Consistent Inputs

The only variable that changes is the model:

- Same prompt
- Same token limit
- Same request structure

This allows for a direct comparison of model performance.

#### Usage Reporting

The API returns usage information through:

```python
response.usage
```

This includes:

- Input tokens
- Output tokens

These values are important because API billing is based on token consumption.

## Evaluating Results

When comparing outputs from multiple models, consider:

### Output Quality

Does the response meet the quality bar required for production?

Questions to ask:

- Is the answer accurate?
- Is reasoning sound?
- Is the writing quality sufficient?
- Would you ship this output to customers?

### Latency

How quickly does the model respond?

In many scenarios:

- Opus produces the most polished responses but takes longer.
- Sonnet offers strong quality with faster responses.
- Haiku often responds extremely quickly while remaining highly capable for simpler tasks.

### Cost

More capable models generally cost more.

The objective is not to find the smartest model—it is to find the least expensive model that reliably produces acceptable results.

> **Rule of thumb:** The right model is the cheapest model whose output you would confidently ship.

## Example Decision-Making

### Simple Definition Generation

Task:

```text
Provide a two-sentence definition.
```

Likely choice:

- Claude Haiku

Reason:

- Fast
- Inexpensive
- Quality is usually more than sufficient

### Regulatory Response Drafting

Task:

```text
Draft a response to a regulatory inquiry.
```

Likely choice:

- Claude Opus

Reason:

- Higher reasoning requirements
- Greater need for precision and nuance

The evaluation process remains identical regardless of the task.

## Routing Different Work to Different Models

Production applications do not need to standardize on a single model.

Instead, different tasks can be routed to different models based on their complexity.

### Example: Operations Dashboard

| Task | Recommended Model |
|---------|---------|
| File classification | Haiku |
| Drafting client updates | Sonnet |
| RFP response generation | Opus |

This approach allows applications to:

- Control costs
- Maintain quality
- Improve performance
- Use each model where it provides the most value

### Benefits of Task Routing

- Faster response times for simple tasks
- Lower overall API costs
- Better allocation of high-capability models
- Greater scalability as workloads grow

## Key Takeaways

- Different Claude models offer different trade-offs between capability, speed, and cost.
- Create a simple evaluation dataset before making production decisions.
- Test models from Haiku upward rather than starting with the most expensive option.
- Use `response.usage` to monitor token consumption and estimate costs.
- Route different types of work to different models rather than using a single model everywhere.

## Recap

- Claude Fable provides Anthropic's highest capability tier for the most demanding workloads.
- Claude Opus is best for deep reasoning and complex tasks.
- Claude Sonnet is the default choice for many production applications.
- Claude Haiku is optimized for speed, scale, and cost efficiency.
- Start evaluations with Haiku and move upward only when quality requirements justify it.
- Measure both output quality and token usage when comparing models.
- Production systems often combine multiple models, selecting the appropriate one for each task.