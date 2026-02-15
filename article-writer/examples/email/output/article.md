# This Week in AI Dev Tools: 5 Releases Worth Your Attention

*A curated look at the developer tools that shipped this week and why they matter for your workflow*

---

## What Shipped This Week

On Tuesday, [Qodo dropped version 2.0](https://www.qodo.ai/blog/introducing-qodo-2-0-agentic-code-review/) of its AI code review platform, and it represents a genuine shift in how automated reviews work. Instead of a single model scanning your pull request and dumping a wall of generic comments, Qodo 2.0 uses a multi-agent architecture where specialized agents each handle a focused slice of the review. One agent checks for security issues. Another evaluates maintainability. A third pulls context from your repo history, past PRs, and prior review decisions to understand what patterns your team actually follows. The result, according to [Qodo's benchmarks](https://www.globenewswire.com/news-release/2026/02/04/3232129/0/en/Qodo-2-0-Redefines-AI-Code-Review-For-Accuracy-and-Enterprise-Trust.html), is 11% higher precision and recall than competing tools. Companies like Monday.com and Box are already running it in production.

That release alone would make this a notable week. But it landed alongside a major Ollama update and continued momentum from Block's open-source Goose agent. The common thread across all of them is a move from AI tools that assist you toward AI tools that act on your behalf. The autocomplete era is fading. The agentic era is here, and it shipped five things worth your time.

---

## The Tools Worth Installing

**[Qodo 2.0](https://www.qodo.ai/blog/introducing-qodo-2-0-agentic-code-review/) -- Agentic Code Review**

If your team does more than a handful of pull requests per day, you already know the bottleneck. [Review time has increased 91%](https://www.qodo.ai/blog/best-ai-code-review-tools-2026/) at teams with high AI adoption, largely because AI-generated code still needs human eyes, and there is a lot more of it now. Qodo 2.0 tackles this head-on with its multi-agent approach. Rather than one model trying to be an expert at everything, it delegates to specialized agents that draw from your full repository context. The practical effect is fewer false positives and comments that actually match your team's conventions rather than generic best practices. The caveat: Qodo's strongest features are behind enterprise pricing. The free tier will give you a taste, but teams running at scale will need to budget for it.

**[Ollama v0.15.3](https://ollama.com/blog/launch) -- Local Models, Zero Config**

Ollama has been the quiet workhorse of the local model scene for a while now, but the [v0.15.3 release](https://github.com/ollama/ollama/releases) that dropped on February 1st added something genuinely useful. The new `ollama launch` command eliminates the configuration dance that most developers dread when setting up local models with coding tools. Run `ollama launch claude` and it sets up everything you need to use local models with Claude Code, no environment variables, no config files, no friction. It also works with Codex, OpenCode, and Droid. On the performance side, NVFP4 and FP8 quantization improvements deliver up to 35% faster token generation on RTX GPUs. This is free, open source, and runs entirely on your hardware. The caveat: you need decent GPU memory for the larger models, and smaller models on modest hardware will not match cloud API quality.

**[Goose by Block](https://github.com/block/goose) -- Open Source AI Agent**

Block, the parent company of Square and Cash App, released Goose as an open-source AI agent under the Apache 2.0 license, and the developer community has noticed. With [over 26,000 GitHub stars](https://block.github.io/goose/), Goose is a terminal-first agent that goes well beyond code suggestions. It can build projects from scratch, write and execute code, debug failures, orchestrate multi-step workflows, and interact with external APIs autonomously. The key differentiator is flexibility. Goose works with any LLM, supports multi-model configurations so you can route different tasks to different models based on cost and capability, and integrates with MCP servers for connecting to your existing tools and data sources. As [VentureBeat covered](https://venturebeat.com/programming-development/jack-dorsey-is-back-with-goose-a-new-ultra-simple-open-source-ai-agent-building-platform-from-his-startup-block), this is Block's bet on open-source AI tooling. The caveat: Goose still requires either API access to a cloud LLM or a local model setup, so it is not a standalone install-and-go experience.

**[CodeRabbit](https://www.coderabbit.ai/) -- AI Reviews on Every PR**

CodeRabbit has been around for a bit, but it keeps earning its spot in conversations about automated code review. It plugs into your GitHub or GitLab workflow and generates structured feedback on every pull request, covering readability, security, maintainability, and potential bugs with line-by-line comments. It integrates over 40 industry-standard linters and security analyzers, then synthesizes everything into human-readable feedback. The standout move: [CodeRabbit is completely free for open source projects](https://www.coderabbit.ai/pricing), and they have shipped a free VS Code extension that reviews committed and uncommitted changes locally. For paid teams, Pro runs about $480 per month for a 20-developer team on annual billing. The caveat: enterprise self-hosted pricing gets steep fast, reportedly around $15,000 per month for on-premises deployments.

**[mabl](https://www.mabl.com/ai-test-automation) -- AI Testing That Writes Itself**

Testing is the part of the development cycle where AI adoption has lagged behind coding assistance, but [mabl's Test Creation Agent](https://www.mabl.com/) is making a compelling case for closing that gap. You describe what you want tested in plain English, and mabl autonomously plans and creates end-to-end tests, building outlines, structured flows, and stable test suites. The numbers mabl reports are aggressive: 10x faster test generation and 85% less maintenance through adaptive auto-healing that fixes broken selectors and flaky tests without your intervention. The IDE integration means developers get test feedback directly in their editor rather than waiting for a CI pipeline to yell at them. The caveat: mabl is aimed at teams with dedicated QA workflows and budget to match. Individual developers or small teams will find the pricing hard to justify compared to writing tests by hand.

---

## One Thing to Try This Week

If you only have 20 minutes this week, install [Ollama](https://ollama.com/blog/launch) and run the new `ollama launch` command. It is the lowest-friction way to get local AI models working with your existing coding tools, and it costs nothing.

Here is the whole experiment. Download Ollama from [ollama.com](https://docs.ollama.com/integrations/claude-code) if you have not already. Update to v0.15 or later. Open your terminal and run `ollama launch claude` or `ollama launch opencode`, whichever tool you already use. It will walk you through picking a model. Start with qwen3-coder if you want a solid coding-focused option. That is it. You are running AI-assisted coding entirely on your own machine, no API keys, no cloud dependency, no usage charges.

The reason I am picking this over the flashier releases is simple. You can test it in a real coding session today and immediately feel whether local models fit your workflow. If they do, you have just eliminated a monthly API bill. If they do not, you have lost nothing but a few minutes.

Try it and reply with what you find. We feature reader experiments in next week's issue, and I am genuinely curious how local model performance lands for people running different hardware setups. Forward this to a teammate who has been complaining about API costs. They will thank you.

---

*You are reading This Week in AI Dev Tools, a weekly newsletter for developers who want the signal without the noise. Every Thursday, we break down the releases that matter and skip the ones that do not.*
