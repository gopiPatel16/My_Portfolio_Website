/** How AI is actually used, stage by stage. Shown as the workflow spine. */
export const workflow = [
  { n: '01', title: 'Idea', body: 'A problem worth solving, and the constraints it has to hold to.' },
  { n: '02', title: 'Prompt', body: 'A structured brief — scope, rules, acceptance criteria, and what the output must not do.' },
  { n: '03', title: 'Claude Code', body: 'AI-assisted implementation, built in pieces small enough to verify one at a time.', primary: true },
  { n: '04', title: 'Evaluate', body: 'Read the output against the brief. Where it drifted, the brief was underspecified.' },
  { n: '05', title: 'Test', body: 'Automated tests and real runs — the acceptance gate, not the model’s own confidence.' },
  { n: '06', title: 'Iterate', body: 'Tighten the prompt, regenerate the part that failed, keep what held.' },
  { n: '07', title: 'Ship', body: 'Deploy, then document what was verified rather than what was assumed.' },
]

/** Capability groups. Every line is backed by a project or the prompt corpus. */
export const capabilities = [
  {
    title: 'Prompt Engineering',
    lede: 'Instruction design treated as an engineering artefact — versioned, constrained, reproducible.',
    items: [
      'Structured multi-section briefs with explicit acceptance criteria',
      'Negative constraints — naming what the output must not do',
      'Context engineering and role framing',
      'Prompt chaining, where one output becomes the next input',
      'Reconstruction prompts that rebuild an entire project from scratch',
    ],
  },
  {
    title: 'LLM Evaluation',
    lede: 'Deciding whether an answer is good enough — in code, before a person ever sees it.',
    items: [
      'Evidence-sufficiency judging with contradiction and gap reporting',
      'Calibrated confidence scoring surfaced to the reader',
      'Scoring rubrics and side-by-side model comparison',
      'Reflection passes that review a draft against its own citations',
      'Bounded retry budgets so a self-correction loop always terminates',
    ],
  },
  {
    title: 'GenAI Workflows',
    lede: 'Multi-step systems where every stage has one narrow, auditable responsibility.',
    items: [
      'Graph-based agent orchestration with conditional edges and loops',
      'Deterministic guardrails placed after model calls, never inside them',
      'Retrieval-augmented generation with provenance preserved end to end',
      'Document ingestion: extract, chunk, embed, index, re-index',
      'Streaming pipeline state to the interface so the work is visible',
    ],
  },
  {
    title: 'AI-Assisted Building',
    lede: 'Using AI as a development partner, with the verification kept firmly on my side.',
    items: [
      'Specification-first development — the brief is the acceptance criteria',
      'Generating implementations, then driving them from tests',
      'Research summarisation and factual verification against sources',
      'Generative media direction with continuity across a clip sequence',
      'Workflow documentation produced from the finished system',
    ],
  },
]

/** The toolkit, grouped. Claude Code is the primary development environment. */
export const toolkit = [
  {
    group: 'AI Development',
    tools: [
      { name: 'Claude Code', primary: true, note: 'Primary development environment' },
      { name: 'GitHub Copilot' },
      { name: 'OpenAI Codex' },
    ],
  },
  {
    group: 'General AI',
    tools: [{ name: 'Claude' }, { name: 'ChatGPT' }, { name: 'Google Gemini' }, { name: 'Grok' }],
  },
  {
    group: 'Research',
    tools: [{ name: 'Perplexity' }, { name: 'Comet' }],
  },
  {
    group: 'Creative & Visual',
    tools: [
      { name: 'Higgsfield' },
      { name: 'Google Flow' },
      { name: 'Google Stitch' },
      { name: 'Google Pomelli' },
    ],
  },
  {
    group: 'Automation',
    tools: [{ name: 'n8n' }],
  },
  {
    group: 'Productivity',
    tools: [{ name: 'Wispr Flow' }],
  },
]
