export type Shot = {
  src: string
  alt: string
  /** How the screenshot should be framed on screen. */
  frame?: 'browser' | 'phone' | 'plain'
  /** Keep out of the card thumbnail — still shown in the case study. */
  hideFromCard?: boolean
  caption?: string
}

export type Metric = { value: string; label: string }

export type Project = {
  slug: string
  name: string
  tagline: string
  year: string
  kind: string
  category: 'Web' | 'Software'
  /** The deployed site, when there is one. The card thumbnail opens it. */
  live?: string
  featured?: boolean
  /** True where the screenshots were captured from the app running locally. */
  liveCaptured?: boolean
  cover: string
  coverAlt: string
  images: Shot[]
  problem: string
  idea: string
  approach: string
  result: string
  contribution: string
  features: string[]
  stack: string[]
  metrics: Metric[]
  /** How AI was actually used to build it. */
  aiWorkflow: string[]
  architecture?: { layer: string; detail: string }[]
  challenges?: string
  learnings?: string
  report?: string
  source?: string
}

/** Screenshots live under /shots/ so they cannot collide with the /projects/:slug route. */
const P = (slug: string, file: string) => `/shots/${slug}/${file}.webp`

export const projects: Project[] = [
  /* ---------------------------------------------------------------- */
  {
    slug: 'knowledge-assistant',
    name: 'Enterprise Multi-Agent Knowledge Assistant',
    tagline:
      'An internal assistant over company documents, answered by eight cooperating agents with citations and a calibrated confidence score.',
    year: '2026',
    kind: 'GenAI platform',
    category: 'Software',
    featured: true,
    cover: P('knowledge-assistant', 'chat-answer'),
    coverAlt:
      'The assistant answering a policy question with two citations and an 80% confidence badge, beside the live agent pipeline',
    images: [
      {
        src: P('knowledge-assistant', 'chat-answer'),
        alt: 'Employee chat showing a cited answer, an 80% confidence badge, and the agent pipeline reporting each stage',
        frame: 'browser',
        caption: 'Every answer carries its citations and the confidence the reflection agent assigned it.',
      },
      {
        src: P('knowledge-assistant', 'dashboard'),
        alt: 'Employee dashboard listing recent conversations and departments',
        frame: 'browser',
        caption: 'The employee portal — chat, history and citations, with no administrative surfaces.',
      },
      {
        src: P('knowledge-assistant', 'admin-documents'),
        alt: 'Administrator document library with version numbers, departments and re-index controls',
        frame: 'browser',
        caption: 'Admin document library: upload, version, re-index, and export in five formats.',
      },
      {
        src: P('knowledge-assistant', 'admin-analytics'),
        alt: 'Administrator analytics showing query volume and token spend',
        frame: 'browser',
        caption: 'Token spend and latency are tracked per question, because the graph accumulates usage.',
      },
      {
        src: P('knowledge-assistant', 'admin-users'),
        alt: 'User and department permission management screen',
        frame: 'browser',
        caption: 'Department grants — the input the deterministic policy agent clamps against.',
      },
      {
        src: P('knowledge-assistant', 'chat-transcript'),
        alt: 'Read-only chat transcript in the administrator audit view',
        frame: 'browser',
        caption: 'Administrators review conversations read-only; every query lands in the audit log.',
      },
    ],
    problem:
      'Company knowledge is scattered across PDFs, Word files, spreadsheets and slide decks. Employees cannot find it, and a chatbot bolted onto those files answers confidently and wrongly — which is worse than no answer at all.',
    idea:
      'Stop asking one model to do the whole job. Decompose it into narrow, individually auditable agents, and put the parts that must never be wrong — access control and evidence ranking — into deterministic code rather than a prompt.',
    approach:
      'Eight agents wired as a LangGraph state machine with two bounded feedback loops. A router classifies the department; a policy agent written in plain code clamps that choice to what the user may actually read; a planner turns the question into focused search queries; retrieval and evidence ranking are deterministic; a verifier judges whether the evidence is sufficient and can send the graph back for another round; a generator writes the answer from numbered evidence only; and a reflection agent reviews the draft before anyone sees it.',
    result:
      'Every claim traces to a document name, department, version and page. Citations are constructed in code from the evidence the model actually referenced, so a citation cannot point at a document that was never retrieved. Both loops share one iteration budget, so the graph is guaranteed to terminate. 108 automated backend tests pass, and the same interface ships as a web app, a Windows and macOS desktop app and an Android build.',
    contribution:
      'Owned the product and its direction, and wrote the build specification the work was carried out against: the two-portal model, department-based access, and the requirement for cited, confidence-scored answers. The code was written by AI coding assistants under my review, milestone by milestone. I tested the Windows and macOS apps on my own machines and reported the failures that led to the fixes — the macOS quarantine error, cross-device connection failures and a document-upload bug.',
    features: [
      'Eight-agent LangGraph pipeline with bounded self-correction loops',
      'Department-level RBAC enforced in deterministic code, outside the LLM',
      'Citations built in code from the evidence the model actually referenced',
      'Live agent pipeline streamed to the browser over server-sent events',
      'Six input formats with page, slide and sheet provenance preserved',
      'Document versioning: replacing a file bumps the version and clears the old vectors first',
      'Single-use invitation links, stored only as a SHA-256 hash, with role and department fixed by the invite',
      'Append-only audit log across logins, uploads, deletions and queries',
      'One Next.js interface packaged as web, Electron desktop and Capacitor Android clients',
      'LLM and embedding providers behind protocols — swapping OpenAI for Claude is one class',
    ],
    stack: [
      'Python 3.12', 'FastAPI', 'LangGraph', 'OpenAI SDK', 'Qdrant', 'PostgreSQL 16',
      'SQLAlchemy 2.0', 'Alembic', 'Pydantic', 'Next.js 16', 'React 19', 'TypeScript',
      'TailwindCSS', 'shadcn/ui', 'Electron', 'Capacitor', 'Docker Compose', 'LangSmith', 'pytest',
    ],
    metrics: [
      { value: '8', label: 'LangGraph agents' },
      { value: '36', label: 'API operations' },
      { value: '108', label: 'Tests passing' },
      { value: '6', label: 'Input formats' },
    ],
    aiWorkflow: [
      'Wrote the architecture as a single structured brief before any code — layers, responsibilities, and what each layer must never do.',
      'Built the graph node by node with Claude Code, keeping each agent small enough to test in isolation.',
      'Iterated the agent prompts against real documents, tightening the structured-output schemas until the router stopped drifting.',
      'Made access control and evidence ranking plain Python precisely because a prompt cannot be trusted with them.',
      'Generated the 32-page technical report from the finished codebase, then verified each claim against the source — it reports no accuracy or latency benchmarks, because none were run.',
    ],
    architecture: [
      { layer: 'Clients', detail: 'Next.js 16 · React 19 · browser, Electron desktop, Capacitor Android' },
      { layer: 'API', detail: 'FastAPI routers · auth guards · validation · SSE stream' },
      { layer: 'Service', detail: 'AuthService · DocumentService · ChatService · IngestionPipeline' },
      { layer: 'Graph', detail: 'LangGraph — 8 agents, conditional edges, bounded loops' },
      { layer: 'Data', detail: 'PostgreSQL 16 (9 tables) · Qdrant vectors · OpenAI embeddings' },
    ],
    challenges:
      'A single LLM asked to answer from thin or contradictory documents hallucinates. The fix was structural rather than prompt-level: bound the retries, and move the guarantees the system depends on out of the model entirely.',
    learnings:
      'Where correctness matters, deterministic code beats a better prompt. The prompt work then goes into the parts that genuinely need judgement — planning, verification and reflection.',
    report: '/reports/knowledge-assistant.pdf',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'gameverse',
    live: 'https://game-verse-eta-ecru.vercel.app/',
    name: 'GAMEVERSE',
    tagline:
      'One React shell that behaves like three separate websites — colour, typeface, weather, ambience and motion all repaint from a single attribute.',
    year: '2026',
    kind: 'Motion frontend',
    category: 'Web',
    featured: true,
    liveCaptured: true,
    cover: P('gameverse', 'portal'),
    coverAlt: 'The GAMEVERSE landing page with three glowing portals into God of War, Mortal Kombat and Valorant',
    images: [
      {
        src: P('gameverse', 'portal'),
        alt: 'GAMEVERSE landing page with three glowing character portals',
        frame: 'browser',
        caption: 'The portal: three worlds, one shell. Captured from the running build.',
      },
      {
        src: P('gameverse', 'god-of-war'),
        alt: 'God of War world with Norse snow weather and Cinzel display type',
        frame: 'browser',
        caption: 'God of War — snow weather, Cinzel display face, cold accent.',
      },
      {
        src: P('gameverse', 'mortal-kombat'),
        alt: 'Mortal Kombat world in ember and fire tones',
        frame: 'browser',
        caption: 'Mortal Kombat — ember particles and an infernal palette, same components.',
      },
      {
        src: P('gameverse', 'valorant'),
        alt: 'Valorant world in cyber neon with the agent roster',
        frame: 'browser',
        caption: 'Valorant — neon cyber grade. Nothing branches on which game is showing.',
      },
      {
        src: P('gameverse', 'valorant-agents'),
        alt: 'Valorant agent roster carousel',
        frame: 'browser',
        caption: 'Rosters are data. Adding a fourth world means adding an object, not a page.',
      },
      {
        src: P('gameverse', 'mobile-portal'),
        alt: 'GAMEVERSE portal on a mobile viewport',
        frame: 'phone',
        caption: 'The portal stacks vertically on mobile with the same theme system.',
      },
    ],
    problem:
      'Three game universes, each needing a genuinely distinct identity, without maintaining three codebases or hardcoding a single asset path.',
    idea:
      'Make the theme an attribute on the document, and make every page generic. If nothing in the code knows which game is showing, adding a world costs nothing.',
    approach:
      'Every colour resolves from CSS custom properties scoped under a data-theme attribute the router writes onto the document. Page components render whatever the data file describes. A build script optimises the photo library into WebP and emits a manifest, so components ask for a group and an index rather than a path.',
    result:
      'Four routes, nine section types and 118 media assets from one shell of 44 files. Ambient audio is synthesised live from Web Audio oscillators rather than shipped as files. Lenis, GSAP ScrollTrigger and Framer Motion all run through one shared frame loop, and every one of them honours prefers-reduced-motion plus an in-app toggle. A 71-check scripted verification in headless Chrome passes 69, with no console errors on any route and layout shift at or below 0.0073.',
    contribution:
      'Owned the project and authored every commit. Defined the product — one portal, three worlds and a section set for each — supplied the section-level design plates the layout follows, and curated 339 MB of source media down to the 106 images and 12 clips the manifest ships. Built it in Claude Code against a live preview: theme system, data-driven page architecture, WebP asset pipeline and manifest, synthesised ambience, and the shared animation loop.',
    features: [
      'One attribute repaints every colour in the application',
      'Media resolved through a generated manifest, never hardcoded',
      'Ambient drone per world built live from Web Audio oscillators',
      'Lenis, GSAP ScrollTrigger and Framer Motion on one shared frame loop',
      'Motion is first-class — with an off switch that actually works',
      'Gallery clips stay unmounted until scrolled to, verified against the production build',
    ],
    stack: ['React 19', 'Vite 6', 'TailwindCSS v4', 'GSAP ScrollTrigger', 'Framer Motion', 'Lenis', 'Web Audio API', 'Vercel'],
    metrics: [
      { value: '118', label: 'Media assets' },
      { value: '34', label: 'Characters' },
      { value: '69/71', label: 'Checks passed' },
      { value: '5.8k', label: 'Lines of code' },
    ],
    aiWorkflow: [
      'Wrote a long structured brief per world — mood, palette, weather, typography, section order — before generating anything.',
      'Generated the key art with image models, passing a consistent style reference so the three worlds stayed distinct but coherent.',
      'Built the shell with Claude Code, then iterated section by section against the brief.',
      'Used the brief as the acceptance criteria: anything the page did that the brief did not ask for came back out.',
    ],
    challenges:
      'Three visual identities in one codebase invites branching everywhere. Forcing all of it through CSS custom properties and a data file kept the component tree honest. The report is equally plain about what the approach did not solve: two hero clips still weigh around 30 MB each, with no low-bitrate path for phones.',
    report: '/reports/gameverse.pdf',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'primegold',
    name: 'PrimeGold',
    tagline:
      'A self-hosted, Tally-shaped double-entry accounting system in daily use at a plywood and door trading business — built to refuse rather than guess.',
    year: '2026',
    kind: 'Full-stack / domain',
    category: 'Software',
    featured: true,
    cover: P('primegold', 'balance-sheet'),
    coverAlt: 'The PrimeGold balance sheet, with a banner confirming debits and credits agree exactly',
    images: [
      {
        src: P('primegold', 'balance-sheet'),
        alt: 'Balance sheet showing liabilities and assets with a banner reading "The books tie. Debits and credits agree exactly."',
        frame: 'browser',
        caption: '“The books tie.” Integer arithmetic means the statement either balances or says why not.',
      },
      {
        src: P('primegold', 'chart-of-accounts'),
        alt: 'Chart of accounts grouped into accounting, inventory and payroll masters',
        frame: 'browser',
        caption: 'Ledgers grouped under Tally’s own reserved chart, because the users already know it.',
      },
      {
        src: P('primegold', 'tax-invoice'),
        alt: 'Printed GST tax invoice with HSN codes and amount in words',
        frame: 'browser',
        caption: 'The printed invoice is a copy of the bill their customers already receive.',
      },
      {
        src: P('primegold', 'payment-voucher'),
        alt: 'Payment voucher with debit and credit columns',
        frame: 'browser',
        caption: 'Function keys pick voucher types; Ctrl+Enter accepts; Esc backs out.',
      },
    ],
    problem:
      'A plywood and door trading business in Raipur already knew TallyPrime, and wanted to keep its books, file GST and track stock without handing the data to a hosted service. A better idea that has to be learned is worse — and a ledger that drifts by rounding is a ledger nobody can tie out.',
    idea:
      'Copy the shape of the software they already use, and make the arithmetic incapable of drifting.',
    approach:
      'No floats anywhere: money is a whole number of paise, quantities whole micro-units, GST rates basis points. That arithmetic lives in one shared package used by both server and client, so the two cannot disagree. And where the software cannot know the answer — a party with no state, so the place of supply is unknown — it says so and posts nothing.',
    result:
      'In use on the client’s own PC with a live company. Masters, vouchers, inventory, GST, payroll and reporting across 61 screens and 239 API route handlers, running from one SQLite file with no cloud account and no subscription, reached from phones and a remote PC over a private Tailscale network. A separate process mirrors every change into Excel workbooks, because the client’s accountant works from spreadsheets. 473 unit tests across 27 files, plus 27 Node scripts that drive the real API against a throwaway company.',
    contribution:
      'Requirements, constraints and product decisions, with the implementation directed through Claude Code: the shared money/quantity/GST arithmetic, the Fastify API, the React client, the Tally-shaped keyboard model and the printed invoice layout. Turned the client’s feedback — often annotated screenshots — into testable instructions, reproduced the defects, tested on the real devices, and packaged and delivered the three builds.',
    features: [
      'Integer-only money and quantity arithmetic in one shared, tested package',
      'Tally keyboard model — function keys pick voucher types, Esc backs out',
      'Printed invoice is a copy of the bill the customer already receives',
      'One client bundle delivered three ways — PWA, Android APK and a portable Windows exe',
      'Every change mirrored into Excel workbooks for the client’s accountant',
      'Runs on premises; phones and a remote PC reach it over a private Tailscale network',
    ],
    stack: ['TypeScript', 'Fastify 5', 'Zod', 'Prisma 5', 'SQLite (WAL)', 'React 18', 'Vite 7', 'Capacitor 6', 'Electron 33', 'Python 3 · openpyxl', 'Tailscale', 'Vitest'],
    metrics: [
      { value: '239', label: 'API route handlers' },
      { value: '65', label: 'Data models' },
      { value: '473', label: 'Unit tests passing' },
      { value: '61', label: 'Screens' },
    ],
    aiWorkflow: [
      'Specified the domain rules first — paise, micro-units, basis points — as constraints the generated code had to satisfy.',
      'Built the shared arithmetic package with Claude Code and drove it entirely from tests, since this is the layer nothing else can compensate for.',
      'Generated the screen scaffolding, then hand-tuned the keyboard model against how the owner actually types.',
      'Used 27 end-to-end check scripts against a throwaway company as the real acceptance gate, rather than trusting any single generated module.',
    ],
    challenges:
      'A door is one piece and 29.166 square feet at the same time. Multiplying a per-square-foot rate by a count of pieces is wrong by the conversion factor, with nothing on screen to contradict it. That maths lives in one tested module rather than three copies that would eventually disagree.',
    report: '/reports/primegold.pdf',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'gk-master',
    name: 'GK Master',
    tagline:
      'An offline-first learning PWA with adaptive selection, spaced revision, and statistics honest enough to say there is not enough data yet.',
    year: '2026',
    kind: 'Progressive Web App',
    category: 'Web',
    featured: true,
    liveCaptured: true,
    cover: P('gk-master', 'answered'),
    coverAlt: 'GK Master showing a wrong answer with the correct one and a full explanation',
    images: [
      {
        src: P('gk-master', 'answered'),
        alt: 'An answered question showing "Not quite", the correct answer, and an explanation of why',
        frame: 'phone',
        caption: 'A wrong answer teaches you something rather than just costing a point.',
      },
      {
        src: P('gk-master', 'home'),
        alt: 'Home screen with today’s 20-question challenge, quick stats and focus area',
        frame: 'phone',
        caption: 'Accuracy shows “—” until there is enough data to report it fairly.',
      },
      {
        src: P('gk-master', 'question'),
        alt: 'Question screen with category and difficulty tags and four options',
        frame: 'phone',
        caption: 'Each question carries its category and difficulty.',
      },
      {
        src: P('gk-master', 'progress'),
        alt: 'Progress screen with per-category accuracy',
        frame: 'phone',
        caption: 'Categories read “Not started” or “Building data”, never a misleading 0%.',
      },
      {
        src: P('gk-master', 'pdf-import'),
        alt: 'PDF import screen previewing questions parsed out of a question paper',
        frame: 'phone',
        caption: 'Import reads MCQs straight out of a PDF and shows you what it found first.',
      },
      {
        src: P('gk-master', 'settings'),
        alt: 'Settings screen with question pack management',
        frame: 'phone',
        caption: 'Packs can only ever add — never quietly redefine an existing question.',
      },
    ],
    problem:
      'Daily practice apps either need an account and a backend, or they show a misleading 0% accuracy the moment you open them.',
    idea:
      'Put the whole thing in the browser, and make the statistics refuse to mislead.',
    approach:
      'A daily challenge chosen fresh each calendar day and stable for that day, resuming exactly where you left off. Weak categories are drilled harder while every category keeps a non-zero share. Wrong answers return on a widening schedule until learned, then retire. Accuracy is withheld until there is enough data to report it fairly.',
    result:
      'A 19-file static build that works with no network after first load — verified by running quizzes with the server stopped. 602 questions built in across 14 categories, 612 with the downloadable pack, and a pack system that installs more, including MCQs parsed straight out of a PDF question paper. 166 tests across 8 suites, on four runtime dependencies, in a 206 KB initial download.',
    contribution:
      'The whole application — learning engine, PDF question parser, PWA and service-worker layer, IndexedDB storage, design tokens and accessibility pass, and the 55-page report.',
    features: [
      'Deterministic daily challenge that resumes exactly where you left off',
      'Adaptive category weighting with a guaranteed non-zero share everywhere',
      'Spaced revision on a widening schedule until a question retires',
      'PDF import that finds MCQs, rejoins wrapped lines and previews before adding',
      'Pack validation that can only ever add, never redefine',
      'No account, no analytics, no third-party requests of any kind',
      'All 16 measured contrast pairs clear WCAG AA, in both light and dark themes',
    ],
    stack: ['TypeScript', 'React 18', 'Vite 5', 'IndexedDB', 'Service Worker', 'pdfjs-dist', 'Vitest', 'Vercel'],
    metrics: [
      { value: '166', label: 'Tests, 8 suites' },
      { value: '602', label: 'Questions built in' },
      { value: '4', label: 'Runtime deps' },
      { value: '7.5k', label: 'Lines of code' },
    ],
    aiWorkflow: [
      'Described the learning engine as rules — determinism, non-zero share, widening revision — and let those drive the implementation.',
      'Built the PDF parser iteratively with Claude Code against real question papers, adding a layout case each time one failed.',
      'Kept the honest-statistics rule as an explicit constraint, because the obvious implementation shows a misleading 0%.',
      'Generated the 55-page report from the finished code, separating what was verified in a real browser from what is only claimed.',
    ],
    report: '/reports/gk-master.pdf',
    source: 'https://github.com/gopiPatel16/GK_Master_Game',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'vault',
    name: 'Vault',
    tagline: 'A self-hosted document vault built on one rule: being signed in is not permission to read a document.',
    year: '2026',
    kind: 'Security engineering',
    category: 'Software',
    cover: '',
    coverAlt: '',
    images: [
      {
        src: P('vault', 'admin-signin'),
        alt: 'Administrator sign-in screen requiring username, password and authenticator code',
        frame: 'browser',
        // Light-mode shot; it blows out beside nine dark thumbnails.
        hideFromCard: true,
        caption: 'Administrator sign-in — both factors required, and this console never leaves the host machine.',
      },
    ],
    problem:
      'Consumer cloud storage means trusting a third party with the plaintext of documents that would be catastrophic to lose control of. Self-hosting removes that third party but makes the address — and therefore the household — discoverable.',
    idea:
      'Split authentication from authorisation to read. Being signed in should buy metadata and nothing else.',
    approach:
      'Two independent secrets. Client authentication buys titles and dates. Reading document bytes additionally requires a Document Master Password the client never stores, never caches and cannot change. Where a capability must not exist it is absent rather than permission-gated — and a route-coverage test walks the live router and fails the build if anything resembling password management ever appears outside the admin surface.',
    result:
      'The two-layer flow was exercised end to end against a live backend: enrol, sign in, browse, get refused without the master password, unlock, download byte-identically, re-lock. 117 tests across 10 suites pass, over roughly 13,300 lines.',
    contribution:
      'Architecture, backend, both web surfaces and the edge front door, plus the threat model, the infrastructure-leakage rules, and migrating a live system onto new hardware without regenerating a single key.',
    features: [
      'Two-layer security model: metadata access and byte access are separate secrets',
      'AES-256-GCM per-document encryption, argon2id password hashing',
      'ECDSA P-256 device identity, so a move to Secure Enclave is a re-enrolment',
      'A route-coverage test fails the build on a stray endpoint',
      'Edge front door serves the site, proxies the API and 404s every admin route',
    ],
    stack: ['NestJS', 'Fastify', 'Prisma', 'PostgreSQL 16', 'TypeScript', 'React', 'Vite', 'argon2id', 'AES-256-GCM', 'Cloudflare Tunnel'],
    metrics: [
      { value: '117', label: 'Tests, 10 suites' },
      { value: '13.3k', label: 'Lines of code' },
      { value: '2', label: 'Independent secrets' },
      { value: '0', label: 'Client recovery routes' },
    ],
    aiWorkflow: [
      'Wrote the threat model first and treated it as the specification — each rule became something the build could check.',
      'Used AI-assisted development for the guard chain and Prisma layer, but reviewed every security-relevant path by hand.',
      'Turned the “absence is the guarantee” rule into automated tests, so the guarantee survives future changes.',
    ],
    challenges:
      'Being able to reach the service must reveal nothing about where it is. No server status, hostname, path or hosting detail may appear in a client response — anything unreachable returns a plain 404.',
    report: '/reports/vault.pdf',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'docvault',
    name: 'DocVault',
    tagline: 'A client’s Android document vault that makes no network calls of any kind — and says plainly what that costs you.',
    year: '2026',
    kind: 'Android / Flutter',
    category: 'Software',
    cover: P('docvault', 'vault'),
    coverAlt: 'DocVault encrypted document list on Android',
    images: [
      { src: P('docvault', 'vault'), alt: 'Encrypted document list', frame: 'phone', caption: 'Every document sealed before it reaches storage.' },
      { src: P('docvault', 'lock'), alt: 'Six-digit PIN lock screen', frame: 'phone', caption: 'Six-digit PIN, with optional fingerprint or face unlock.' },
      { src: P('docvault', 'detail'), alt: 'Document detail screen', frame: 'phone', caption: 'Per-document second lock for the documents that matter most.' },
      { src: P('docvault', 'categories'), alt: 'Category management screen', frame: 'phone', caption: 'Seven built-in categories, plus your own.' },
      { src: P('docvault', 'activity'), alt: 'Activity log screen', frame: 'phone', caption: 'A local activity log — nothing leaves the device.' },
    ],
    problem:
      'A client wanted their business paperwork — licences, agreements, bills and statements — off the phone’s gallery and downloads folder, without it going anywhere near a cloud account. Passports, deeds and policies are exactly the documents people are least willing to upload, and exactly the ones every storage app wants to sync.',
    idea: 'Remove the network entirely, and be honest about the consequence.',
    approach:
      'Every document is sealed with AES-256-GCM before it reaches storage, under a key wrapped by a PBKDF2-stretched PIN and held by the Android Keystore. Documents that matter most take a second encryption layer under a separate PIN. The app auto-locks the moment it leaves the foreground — suppressed only while a picker the app itself opened is on screen.',
    result:
      'Ten releases, from 1.0.0 to v1.6.2 (build 10), for Android 7.0+ — 38 Dart files and 7,551 lines, 152 lines of Kotlin for the two things Flutter plugins do not cover, 60 tests in 5 suites, and no static-analysis issues. Distributed as a signed APK from a download link, not yet on Google Play. The report states the trade-off openly: the vault is excluded from Android backup, and losing both the PIN and the recovery key leaves the documents unreadable — a consequence of the security model, not an oversight.',
    contribution:
      'Built for a client and delivered to them directly as a signed APK: the entire application — crypto and key handling, three schema versions and their migrations, the screens, the signed release pipeline across ten builds, and a plain-language install guide written for a non-technical reader.',
    features: [
      'Six-digit PIN with optional fingerprint or face unlock',
      'AES-256-GCM per document, key wrapped under a PBKDF2-stretched PIN',
      'Per-document second lock with its own four-digit PIN',
      'Auto-lock on backgrounding, suppressed only for the app’s own picker',
      'Recovery key and recovery email, so a forgotten PIN is not automatically the end',
      'PIN guessing costs 210,000 PBKDF2 iterations per attempt',
      'Excluded from Android automatic backup, so the vault cannot be restored elsewhere',
      'No network permission, no accounts, no analytics, no telemetry',
    ],
    stack: ['Flutter 3.47', 'Dart 3.13', 'Kotlin', 'Android Keystore', 'AES-256-GCM', 'PBKDF2', 'SQLite'],
    metrics: [
      { value: '60', label: 'Tests, 5 suites' },
      { value: '7.5k', label: 'Lines of Dart' },
      { value: '0', label: 'Network calls' },
      { value: 'v1.6.2', label: 'Shipped build' },
    ],
    aiWorkflow: [
      'Specified the crypto envelope and the auto-lock rule up front, since both are easy to get subtly wrong.',
      'Built the Flutter screens with AI assistance, then verified key handling and migrations by hand.',
      'Wrote the client install guide for a non-technical reader and tested it by following it literally.',
    ],
    report: '/reports/docvault.pdf',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'sugar-rush',
    live: 'https://sugar-rush-a4g8.vercel.app/',
    name: 'Sugar Rush',
    tagline: 'A three-role ordering platform rebuilt from a PHP original, re-architected to remove a class of security flaws.',
    year: '2026',
    kind: 'Full-stack commerce',
    category: 'Web',
    cover: P('sugar-rush', 'storefront'),
    coverAlt: 'Sugar Rush storefront hero for the Donuts world',
    images: [
      { src: P('sugar-rush', 'storefront'), alt: 'Cinematic storefront hero for the Donuts world', frame: 'browser', caption: 'Four themed dessert worlds, each with its own palette and particles.' },
      { src: P('sugar-rush', 'catalogue'), alt: 'Product catalogue with filter tags', frame: 'browser', caption: 'Browse and build a cart without logging in — only checkout needs an account.' },
      { src: P('sugar-rush', 'inventory'), alt: 'Read-only inventory view for the sales role', frame: 'browser', caption: 'Sales can read inventory but not edit it.' },
      { src: P('sugar-rush', 'sales-report'), alt: 'Monthly and yearly sales charts in the admin area', frame: 'browser', caption: 'Admin reporting, captured against the real database.' },
    ],
    problem:
      'The original PHP, MySQL and XAMPP system could not run on serverless infrastructure, and trusted the client with decisions the server should have been making.',
    idea: 'Rewrite it so a bypassed redirect still cannot mutate data.',
    approach:
      'Defence in depth: page routes gated by middleware, and every server action independently re-checking the session role. Promotions are computed by one shared module that runs on the client for the cart preview and again on the server from its own clock and price list, so a discount cannot be forged.',
    result:
      'Customer, sales and admin areas across 27 compiled routes and 71 files, with a Vercel-ready configuration — pooled Prisma connections, Blob image storage, automatic environment derivation. All 13 server actions carry a role guard and validate their input against a schema; there is no raw SQL and the strict type check reports no errors. Every screenshot in its report was captured against the real Neon database, holding 31 products and 11 orders at the time.',
    contribution:
      'The full rewrite — data model, auth and authorisation, the offers engine, all three role areas, the themed storefront and the deployment configuration.',
    features: [
      'Promotions recomputed server-side so a discount cannot be forged',
      'Cart in localStorage that survives the login round-trip',
      'Four themed dessert worlds driven from a single config file',
      'Admin CRUD with image upload, CSV export and sales charts',
      'All 13 server actions independently re-check the role and validate their input',
    ],
    stack: ['Next.js 14', 'TypeScript', 'Prisma', 'PostgreSQL', 'Neon', 'NextAuth', 'TailwindCSS', 'Vercel Blob'],
    metrics: [
      { value: '27', label: 'Compiled routes' },
      { value: '13/13', label: 'Guarded actions' },
      { value: '5.5k', label: 'Lines of code' },
      { value: '5', label: 'Data models' },
    ],
    aiWorkflow: [
      'Audited the PHP original first and listed the flaws the rewrite had to close — that list became the specification.',
      'Generated the storefront hero videos from written shot briefs, then shipped them into the four dessert worlds.',
      'Built the offers engine once and shared it across client and server so the two could not diverge.',
      'Verified the guards by inspection rather than by test suite — the report records no automated tests, because none were written.',
    ],
    report: '/reports/sugar-rush.pdf',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'operate',
    name: 'Operate',
    tagline: 'An ongoing client build: a company management system where routes are closed by default and authorisation is checked twice, two different ways.',
    year: '2026',
    kind: 'Enterprise web app',
    category: 'Software',
    cover: '',
    coverAlt: '',
    images: [],
    problem:
      'A client — a small plywood and flush-door manufacturer — took customer orders informally, produced against them and dispatched with paperwork, while paying people for what they completed. Those three facts lived in a phone’s messages, notes on paper and somebody’s memory, with nothing tying them together. They needed order capture, employee tasks and a chain of custody for every order as one application, on one ordinary PC, with nothing leaving the building.',
    idea: 'Make the safe state the default, so a mistake fails closed.',
    approach:
      'Authentication is a global guard: a route is reachable without a token only if it says so explicitly, so a forgotten decorator leaves a route shut. Authorisation is then checked twice — a permission decides whether you may perform a kind of action at all, and the service decides which rows you may perform it on.',
    result:
      'An ongoing client engagement: four of ten phases delivered and in use for testing, with the remaining scope being specified as the earlier phases are reviewed. Order Book, ERP tasks and the admin shell are built, across 37 endpoints, 22 tables and 17,497 tracked lines. 127 tests pass — 108 against the API and 19 against the web client — and the typecheck is clean. Order traceability is Phase 5 and not yet started.',
    contribution:
      'Architecture and stack decisions, database and seven migrations, the authorisation model of 43 permissions across 3 roles, the API, the React admin shell, and a one-command local runtime that starts database, API and client together. Delivered phase by phase against requirements agreed with the client, one commit per approved phase.',
    features: [
      'One order number linking Order Book, ERP and traceability',
      'Routes closed by default — a missing decorator fails safe',
      'Two-stage authorisation: permission to act, then row-level scoping',
      'Append-only audit log with a hash chain — 2,900 records so far, including 291 recorded refusals',
      'Incoming customer messages captured through the same endpoint a WhatsApp provider will use',
      'Self-hosted with no system-wide installs and no administrator rights',
    ],
    stack: ['TypeScript', 'NestJS', 'Prisma', 'PostgreSQL', 'React 19', 'Vite', 'TailwindCSS v4', 'TanStack Query', 'Jest'],
    metrics: [
      { value: '127', label: 'Tests passing' },
      { value: '37', label: 'API endpoints' },
      { value: '43', label: 'Permissions' },
      { value: '4/10', label: 'Phases delivered' },
    ],
    aiWorkflow: [
      'Set the authorisation model down as rules before any endpoint existed, so generated routes inherited the safe default.',
      'Worked phase by phase with Claude Code, keeping each phase behind its own passing test suite before starting the next.',
      'Generated the report from the running system, which is how the hash-chain defect below was found in the first place.',
    ],
    challenges:
      'Writing the report surfaced a real defect. Each audit record is hashed over its own contents, including two JSON columns — and PostgreSQL’s jsonb type does not preserve key order, so re-reading a row can produce a different serialisation and flag an unaltered record as altered. 707 of the 1,305 records carrying a JSON payload re-hash differently. Every record’s stored link to its predecessor is intact, so the chain is continuous; the fault is in how verification re-serialises, not in the chain.',
    report: '/reports/operate.pdf',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'abyssal-ventures',
    live: 'https://abyssal-ventures.vercel.app/',
    name: 'Abyssal Ventures',
    tagline: 'A cinematic scroll-dive site where scrolling down is descending — 318 frames scrubbed against one scroll value, with no build step.',
    year: '2026',
    kind: 'Prompt-driven / creative',
    category: 'Web',
    cover: P('abyssal-ventures', 'sunlit'),
    coverAlt: 'The Triton-X submersible descending through the sunlit zone',
    images: [
      { src: P('abyssal-ventures', 'surface'), alt: 'The Triton-X on the surface at dawn', frame: 'plain', caption: 'The surface — first of five chained clips.' },
      { src: P('abyssal-ventures', 'sunlit'), alt: 'The submersible descending through the sunlit zone', frame: 'plain', caption: 'Each clip’s final frame became the next clip’s start image.' },
      { src: P('abyssal-ventures', 'sea-floor'), alt: 'The submersible hovering above the sea floor under floodlights', frame: 'plain', caption: 'The floor, at 3,800 m. Scroll position drives everything on screen.' },
    ],
    problem:
      'A narrative interface where the visuals, the instrumentation and the copy cannot desynchronise, driven by one gesture only.',
    idea: 'Derive everything from a single number, so drift is structurally impossible.',
    approach:
      'Every animated property is a pure function of one normalised scroll value: the frame index, the depth read-out, the canvas colour grade, the page background and the text reveals. The footage was generated as five clips, each clip’s final frame passed as the next clip’s start image so the descent joins seamlessly.',
    result:
      'A 130-line HTML document with 277 lines of CSS and 208 lines of JavaScript. No package.json, no bundler, no framework, and every library vendored so there is no runtime CDN dependency. The artefact in Git is exactly what ships.',
    contribution:
      'Concept, the generative-media prompt chain that produced the descent, the scroll-scrub engine and depth curve, the offline FFmpeg grade-and-extract pipeline, and the static deployment.',
    features: [
      'A single scroll value drives frame, depth, grade, background and copy',
      'Piecewise depth curve so each fifth of the page is one act of the descent',
      'Seamless five-clip descent built by chaining last frame into next start frame',
      'Zero build step — development and production serve the same bytes',
    ],
    stack: ['HTML5', 'CSS3', 'Vanilla JavaScript', 'Canvas 2D', 'Lenis', 'Three.js', 'FFmpeg', 'Python 3.12', 'Vercel'],
    metrics: [
      { value: '318', label: 'Scrubbed frames' },
      { value: '3,800', label: 'Metres of descent' },
      { value: '5', label: 'Chained clips' },
      { value: '0', label: 'Build steps' },
    ],
    aiWorkflow: [
      'Generated one hero image of the vessel first, then passed it as an identity reference to every clip so the submersible stayed identical throughout.',
      'Chained the clips by using each one’s final frame as the next one’s start image — the trick that makes five separate generations read as one unbroken descent.',
      'Wrote each shot as a directed brief: camera path, duration, aspect ratio, and an explicit list of looks to exclude.',
      'Graded and extracted the frames offline with FFmpeg, so the browser only ever scrubs a static sequence.',
    ],
    report: '/reports/abyssal-ventures.pdf',
  },

  /* ---------------------------------------------------------------- */
  {
    slug: 'bharti-engineering',
    live: 'https://bharti-engineering.vercel.app/',
    name: 'Bharti Engineering & Construction',
    tagline: 'A client’s corporate marketing site in two files — and a full technical, design and content audit of it.',
    year: '2026',
    kind: 'Static web',
    category: 'Web',
    liveCaptured: true,
    cover: P('bharti-engineering', 'hero'),
    coverAlt: 'Bharti Engineering & Construction site hero',
    images: [
      { src: P('bharti-engineering', 'hero'), alt: 'Site hero with the company name and two calls to action', frame: 'browser', caption: 'Two files, no framework, no build step. Captured from the running site.' },
      { src: P('bharti-engineering', 'profile'), alt: 'Company profile section with statistics', frame: 'browser', caption: 'Company profile and figures.' },
      { src: P('bharti-engineering', 'services'), alt: 'Nine service cards', frame: 'browser', caption: 'Nine services in a responsive grid.' },
      { src: P('bharti-engineering', 'contact'), alt: 'Contact section with location, phone and email', frame: 'browser', caption: 'Contact and enquiry details.' },
      { src: P('bharti-engineering', 'mobile-hero'), alt: 'The site on a mobile viewport', frame: 'phone', caption: 'The mobile layout, captured at 390px.' },
    ],
    problem: 'A client — a construction firm — needed a credible web presence that loads instantly and can be maintained without a toolchain.',
    idea: 'Ship hand-written HTML and CSS, then audit it as rigorously as a framework project.',
    approach:
      'A single-page static site — 2 files, 1,005 lines — followed by an audit that verified every statement against the source or the live rendered page, with screenshots captured by headless Chrome over a local server.',
    result: 'A shipped marketing site plus a 28-page report covering the design system, section architecture, responsive behaviour, defects found, and SEO and accessibility findings.',
    contribution: 'Built and delivered the site for the client, and produced the audit that goes with it, including the defect log and deployment recommendations.',
    features: ['Two files, no framework, no build step', 'Documented design system and breakpoints', 'Defect log with SEO, accessibility and performance findings'],
    stack: ['HTML5', 'CSS3', 'Vanilla JavaScript'],
    metrics: [
      { value: '2', label: 'Files' },
      { value: '1,005', label: 'Lines' },
      { value: '33.9', label: 'KB total' },
    ],
    aiWorkflow: [
      'Generated the markup and design system from a written brief, then hand-checked it against the rendered page.',
      'Used headless Chrome to capture every section and drive the responsive audit rather than eyeballing it.',
    ],
    report: '/reports/bharti-engineering.pdf',
  },
]

export const featured = projects.filter((p) => p.featured)
export const others = projects.filter((p) => !p.featured)
export const bySlug = (slug: string) => projects.find((p) => p.slug === slug)
export const CATEGORIES = ['All', 'Web', 'Software'] as const
