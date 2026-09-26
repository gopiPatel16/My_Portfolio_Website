export const profile = {
  name: 'Gopi Patel',
  roles: ['AI Prompt Engineer', 'GenAI Workflow Specialist'],
  roleLine: 'AI Prompt Engineer · GenAI Workflow Specialist',
  location: 'Raipur, Chhattisgarh, India',
  locationShort: 'Raipur, India',
  email: 'patelgopiii16@gmail.com',
  phone: '6260301778',
  phoneHref: '+916260301778',
  linkedin: 'https://www.linkedin.com/in/gopi-patidar-33b0a1419/',
  github: 'https://github.com/gopiPatel16',
  githubUser: 'gopiPatel16',

  /**
   * Client work, as stated by Gopi: PrimeGold, Operate, DocVault, Bharti
   * Engineering and VanWood. The last of those is not among the projects
   * listed on the site, so this figure is a declared one, not derived from
   * the project data.
   */
  clientProjects: 5,

  /** Built from the resume script; the site serves a copy of the same PDF. */
  resume: {
    src: '/resume/Gopi_Patel_Resume.pdf',
    title: 'Gopi Patel — Resume',
    download: 'Gopi_Patel_Resume.pdf',
  },

  /** Hero statement. Derived from the stated summary, not embellished. */
  statement: 'Building real projects and intelligent workflows with modern AI.',

  positioning:
    'I design prompts, evaluate model output against explicit criteria, and build GenAI workflows — then use AI-assisted development to ship the software around them.',

  summary:
    'Entry-level AI Prompt Engineer skilled in designing prompts, evaluating LLM outputs, creating scoring rubrics, and building GenAI workflows using ChatGPT, Claude, Gemini and automation tools. Experienced in content evaluation, research summarisation, factual verification and workflow documentation.',
} as const

export const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Projects' },
  { id: 'prompts', label: 'Prompts' },
  { id: 'toolkit', label: 'Toolkit' },
  { id: 'research', label: 'Research' },
  { id: 'education', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const

/** Counted from the project set and the source trees. */
export const heroStats = [
  { value: 10, label: 'Projects built' },
  { value: 9, label: 'Technical reports' },
  { value: 8, label: 'Agent GenAI pipeline' },
  { value: 1, label: 'IEEE paper accepted' },
]
