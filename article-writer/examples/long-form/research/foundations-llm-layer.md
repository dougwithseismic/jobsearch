# Research: Choosing Your Foundation Model

## Head-to-Head Comparisons (2026)

### Claude Opus 4.5
- 80.9% on SWE-bench Verified (highest for coding)
- Excels at long-horizon autonomous tasks
- Sustained reasoning, multi-step execution
- "Autonomous work sessions routinely stretch to 20-30 minutes" - Adam Wolff
- Strong at maintaining coherence over long traces

### GPT-5 / GPT-5.2
- 96.7% tool calling accuracy (tau2-bench telecom)
- 74.9% SWE-bench Verified
- Strongest on structured reasoning benchmarks
- Best function calling reliability

### Gemini 3 Pro
- 30% reduction in tool-calling mistakes at Geotab
- 76.8% SWE-bench Verified
- Strong multimodal capabilities
- Best for tasks combining vision + reasoning

### Open Source (Llama 4, Kimi K2.5)
- Rapidly closing gap on proprietary models
- Kimi K2.5 competitive on many benchmarks
- Key advantage: self-hosting, data privacy, fine-tuning

## Cost and Latency
- Output tokens cost 2-5x more than input tokens
- Frontier models: $10-75 per million output tokens
- Smaller models: fraction of cost for many tasks
- Prompt caching can reduce costs up to 90%
- Smart routing: 30-50% cost reduction by matching model to task

## Model Routing Strategy
- No single model wins everything
- 2026 demands model-switching strategies
- GPT for structured reasoning, Claude for coding, Gemini for multimodal
- Tiered routing: 70% cheap models, escalate when needed
- Customer service example: routing 80% to cheaper model, 20% to frontier = 75% cost reduction

## Context Window Impact
- Larger windows enable more complex agent architectures
- But longer contexts = more tokens = higher cost
- Compaction strategies essential for long-running agents
- Retrieval-augmented approaches scale better than raw context

## Fine-tuned Models in Production
- Smaller fine-tuned models handle specific tasks at fraction of cost
- Common pattern: fine-tuned classifier for routing, frontier model for complex reasoning
- Distillation from frontier models to smaller specialized models
