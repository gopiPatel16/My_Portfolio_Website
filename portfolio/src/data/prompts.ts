import { outputPrompts } from './output-prompts'

/**
 * Prompt → model → output, beside the real media.
 *
 * Two kinds of case live here:
 *  - Output prompts: a structured prompt written in the format of the model that
 *    made the output, describing what the output actually shows. Video models were
 *    identified from the files (Google C2PA credentials, Veo and Gemini
 *    watermarks); every image generation is ChatGPT and uses the OpenAI structure.
 *    The text comes from `output-prompts.ts`, generated from the reviewed prompts
 *    document, so it cannot drift from it.
 *
 * `shippedTo` is set only where the output is byte-identical to an asset in that
 * project's source, or was already established for it.
 */
export type PromptCase = {
  id: string
  title: string
  intent: string
  model: string
  technique: string
  prompt: string
  /** Where the output ended up being used, when it was used. */
  shippedTo?: string
  /**
   * `width` and `height` are the file's own pixel size. The output box takes
   * that exact shape, so every output fills its box, and a portrait output gets
   * a portrait box.
   */
  media:
    | { kind: 'video'; src: string; poster: string; alt: string; width: number; height: number }
    | { kind: 'image'; src: string; alt: string; width: number; height: number }
}

const CHATGPT = 'ChatGPT image generation'
const OPENAI = 'OpenAI prompt structure'
const FLOW = 'Google Flow · Gemini Pro'

export const promptCases: PromptCase[] = [
  {
    id: 'sundae',
    title: 'Motion a storefront can loop behind text',
    intent: 'A hero video for one of four themed dessert worlds.',
    model: 'Google Veo',
    technique: 'Gemini structure · text-to-video',
    prompt: outputPrompts['icecream.mp4'],
    shippedTo: 'Sugar Rush',
    media: {
      kind: 'video',
      width: 1280,
      height: 720,
      src: '/prompts/sundae-orbit.mp4',
      poster: '/prompts/sundae-orbit.webp',
      alt: 'A four-scoop sundae in a striped bowl as candies drift through a pastel sky',
    },
  },
  {
    id: 'milkshake',
    title: 'Same grammar, different mood',
    intent: 'A second hero video, deliberately darker, from the same prompt structure.',
    model: 'Google Veo',
    technique: 'Gemini structure · image-to-video',
    prompt: outputPrompts['thickshake.mp4'],
    shippedTo: 'Sugar Rush',
    media: {
      kind: 'video',
      width: 1280,
      height: 720,
      src: '/prompts/milkshake-orbit.mp4',
      poster: '/prompts/milkshake-orbit.webp',
      alt: 'A chocolate cookie milkshake with a slow-motion splash against a dark purple background',
    },
  },
  {
    id: 'smoothie',
    title: 'Letting the subject carry the motion',
    intent: 'A third hero video where falling fruit, not the camera, does the moving.',
    model: 'Google Veo',
    technique: 'Gemini structure · text-to-video',
    prompt: outputPrompts['smoothies.mp4'],
    shippedTo: 'Sugar Rush',
    media: {
      kind: 'video',
      width: 1280,
      height: 720,
      src: '/prompts/smoothie-tray.mp4',
      poster: '/prompts/smoothie-tray.webp',
      alt: 'Three smoothies on a woven tray as fresh fruit falls through a golden-hour sky',
    },
  },
  {
    id: 'background',
    title: 'Art-directing the set, not the subject',
    intent: 'A hero background for a wood manufacturer that leaves room for the copy.',
    model: CHATGPT,
    technique: OPENAI,
    prompt: outputPrompts['background.jpeg'],
    media: {
      kind: 'image',
      width: 1600,
      height: 908,
      src: '/prompts/vanwood-hero.webp',
      alt: 'The VanWood site built on the generated interior: a lit walnut door centred in dark negative space, with the headline set into the empty area beside it',
    },
  },
  {
    id: 'vanwood-process',
    title: 'Briefing a scroll story, step by step',
    intent: 'A pinned section that assembles a flush door across eight manufacturing steps.',
    model: 'Coding agent',
    technique: 'Claude prompt structure',
    prompt: outputPrompts['door.mp4'],
    media: {
      kind: 'video',
      width: 1280,
      height: 726,
      src: '/prompts/vanwood-process.mp4',
      poster: '/prompts/vanwood-process.webp',
      alt: 'Screen recording of the VanWood process section building a flush door layer by layer as the page scrolls',
    },
  },
  {
    id: 'factory',
    title: 'Building a world, not a product shot',
    intent: 'An establishing scene with its own internal logic and motion.',
    model: 'Google Veo',
    technique: 'Gemini structure · image-to-video',
    prompt: outputPrompts['donut.mp4'],
    shippedTo: 'Sugar Rush',
    media: {
      kind: 'video',
      width: 1280,
      height: 720,
      src: '/prompts/candy-factory.mp4',
      poster: '/prompts/candy-factory.webp',
      alt: 'A giant pink donut on a candy-factory platform with candies floating past',
    },
  },
  {
    id: 'concepts',
    title: 'Three directions from one constraint set',
    intent: 'Explore distinct design directions without changing the brand palette.',
    model: CHATGPT,
    technique: OPENAI,
    prompt: outputPrompts['rk-concepts.webp'],
    media: {
      kind: 'image',
      width: 1400,
      height: 1120,
      src: '/prompts/rk-concepts.webp',
      alt: 'Three full-page website concept directions sharing one dark walnut and copper palette',
    },
  },
  {
    id: 'gameverse',
    title: 'A brief specific enough to build from',
    intent: 'Define three game worlds precisely enough that the build could follow.',
    model: CHATGPT,
    technique: OPENAI,
    prompt: outputPrompts['gameverse-portal.webp'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'image',
      width: 1500,
      height: 1000,
      src: '/prompts/gameverse-portal.webp',
      alt: 'A landing page concept with three glowing game portals side by side',
    },
  },
  {
    id: 'warrior-keyart',
    title: 'Key art with every detail pinned down',
    intent: 'Character key art specific enough to regenerate the same warrior again.',
    model: CHATGPT,
    technique: OPENAI,
    prompt: outputPrompts['kratos.png'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'image',
      width: 1200,
      height: 800,
      src: '/prompts/warrior-keyart.webp',
      alt: 'A bald, bearded warrior with a red painted stripe standing in a blizzard before a ruined tower',
    },
  },
  {
    id: 'warrior-blizzard',
    title: 'Motion from the world, not the character',
    intent: 'Animate the warrior key art while his identity stays exactly as drawn.',
    model: 'Google Veo',
    technique: 'Gemini structure · image-to-video',
    prompt: outputPrompts['hero.mp4'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'video',
      width: 1280,
      height: 720,
      src: '/prompts/warrior-blizzard.mp4',
      poster: '/prompts/warrior-blizzard.webp',
      alt: 'The warrior key art animated with drifting snow and ravens circling the ruined tower',
    },
  },
  {
    id: 'archer-keyart',
    title: 'A character defined by what he carries',
    intent: 'Key art for the young archer, with the bow and quiver fixed as required details.',
    model: CHATGPT,
    technique: OPENAI,
    prompt: outputPrompts['Atreus.png'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'image',
      width: 1200,
      height: 800,
      src: '/prompts/archer-keyart.webp',
      alt: 'A young archer with a red-fletched quiver and a bow in a snowy valley at dusk',
    },
  },
  {
    id: 'archer-draw',
    title: 'Directing an action inside one shot',
    intent: 'Turn the archer still into a full bow draw without breaking his anatomy.',
    model: 'Google Veo',
    technique: 'Gemini structure · image-to-video',
    prompt: outputPrompts['boy.mp4'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'video',
      width: 1280,
      height: 720,
      src: '/prompts/archer-draw.mp4',
      poster: '/prompts/archer-draw.webp',
      alt: 'The young archer raising his bow and drawing an arrow as the snow turns to blizzard',
    },
  },
  {
    id: 'sorceress-keyart',
    title: 'Mood carried by the background',
    intent: 'Key art for a sorceress, with the fortress and peaks setting the tone.',
    model: CHATGPT,
    technique: OPENAI,
    prompt: outputPrompts['freya.png'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'image',
      width: 1200,
      height: 800,
      src: '/prompts/sorceress-keyart.webp',
      alt: 'A sorceress with long braids and an amber pendant before a lit mountain fortress',
    },
  },
  {
    id: 'freya',
    title: 'Animating a still instead of redrawing it',
    intent: 'Give an existing character portrait motion without losing the face.',
    model: 'Google Veo · Gemini app',
    technique: 'Gemini structure · image-to-video',
    prompt: outputPrompts['freya.mp4'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'video',
      width: 720,
      height: 1280,
      src: '/prompts/freya-portrait.mp4',
      poster: '/prompts/freya-portrait.webp',
      alt: 'A fur-caped warrior in falling snow, a dark castle behind her in the mountains',
    },
  },
  {
    id: 'thunder-poster',
    title: 'Typography the model has to get right',
    intent: 'A character poster where the title text must come out spelled exactly.',
    model: CHATGPT,
    technique: OPENAI,
    prompt: outputPrompts['raiden.png'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'image',
      width: 800,
      height: 1202,
      src: '/prompts/thunder-poster.webp',
      alt: 'A thunder-god character poster with lightning from both hands, titled RAIDEN, God of Thunder',
    },
  },
  {
    id: 'reptile-poster',
    title: 'A tagline as a hard constraint',
    intent: 'A second poster in the same system, carrying a longer line of set text.',
    model: CHATGPT,
    technique: OPENAI,
    prompt: outputPrompts['reptile.png'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'image',
      width: 800,
      height: 1202,
      src: '/prompts/reptile-poster.webp',
      alt: 'A reptilian ninja poster titled REPTILE with the tagline Hide in the shadows, strike in silence',
    },
  },
  {
    id: 'gow',
    title: 'Cutting a sequence across six shots',
    intent: 'Six shots and an edit, with the same two characters in every one.',
    model: 'Google Veo',
    technique: 'Gemini structure · multi-shot sequence',
    prompt: outputPrompts['gow.mp4'],
    shippedTo: 'GAMEVERSE',
    media: {
      kind: 'video',
      width: 1280,
      height: 720,
      src: '/prompts/gow-axe.mp4',
      poster: '/prompts/gow-axe.webp',
      alt: 'A bearded warrior shouldering a glowing blue axe on a storm-lit mountain ridge',
    },
  },
  {
    id: 'triton',
    title: 'One vessel, five clips, no seams',
    intent: 'Generate a continuous underwater descent from five separate clips.',
    model: FLOW,
    technique: 'Gemini structure · identity reference + last-frame chaining',
    prompt: outputPrompts['triton-surface.mp4'],
    shippedTo: 'Abyssal Ventures',
    media: {
      kind: 'video',
      width: 960,
      height: 540,
      src: '/prompts/triton-surface.mp4',
      poster: '/prompts/triton-surface.webp',
      alt: 'The Triton-X submersible on the ocean surface at dusk, diving into open blue water',
    },
  },
  {
    id: 'orbit',
    title: 'Directing a camera, not describing a scene',
    intent: 'A loopable orbit usable as a scroll-scrub sequence.',
    model: FLOW,
    technique: 'Gemini structure · camera orbit',
    prompt: outputPrompts['submarine-orbit.mp4'],
    shippedTo: 'Abyssal Ventures',
    media: {
      kind: 'video',
      width: 960,
      height: 540,
      src: '/prompts/submarine-orbit.mp4',
      poster: '/prompts/submarine-orbit.webp',
      alt: 'A luxury passenger submarine orbiting through a sunlit coral canyon',
    },
  },
]

/**
 * Counted, not typed in. The last two drifted out of date once before — they
 * were still claiming 11 and 7 after the corpus had moved on — so they are
 * derived from the cases themselves and cannot go stale again. The line count
 * is `wc -l` on the authored prompt corpus.
 */
export const promptStats = [
  { value: '2,315', label: 'Lines of authored prompts' },
  { value: String(promptCases.length), label: 'Worked examples below' },
  { value: String(promptCases.filter((c) => c.shippedTo).length), label: 'Shipped into projects' },
]
