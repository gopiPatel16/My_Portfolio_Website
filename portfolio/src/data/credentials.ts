/**
 * Experience and certifications, taken only from the documents in
 * `offer letter and certifications`. Each entry links the document it comes
 * from, which the site opens in its PDF reader.
 *
 * Deliberately left out:
 *  - "AI Fluency for Small Businesses": the folder holds only a bookmark to the
 *    course page, not a certificate, so completion is not claimed.
 *  - Any completion claim for the internship: the folder holds the offer letter,
 *    not a completion certificate, so the entry describes the role as offered.
 *  - A date for Claude Code 101: the certificate does not carry one.
 */

export type Doc = { src: string; title: string }

export const experience = [
  {
    year: '2025',
    role: 'Web Development Intern',
    org: 'Udupi Web Solutions (UWS)',
    place: 'Udupi, Karnataka · On-site',
    term: '4-month internship from 3 February 2025',
    /** The responsibilities as the offer letter sets them out. */
    scope: [
      'Developing and maintaining web applications',
      'Collaborating with the design and backend teams to deliver features',
      'Testing and debugging web applications',
      'Taking part in code reviews and knowledge-sharing sessions',
    ],
    doc: {
      src: '/credentials/uws-internship-offer-letter.pdf',
      title: 'Udupi Web Solutions — internship offer letter',
    } satisfies Doc,
    /**
     * The same letter rendered to pictures by `scripts/doc-images.py`: a small
     * sheet for the button, the full page for what it opens. Download still
     * hands over the signed PDF.
     */
    photo: {
      kind: 'image' as const,
      src: '/credentials/uws-internship-offer-letter.webp',
      thumb: '/credentials/uws-internship-offer-letter-thumb.webp',
      title: 'Udupi Web Solutions — internship offer letter',
      downloadSrc: '/credentials/uws-internship-offer-letter.pdf',
      download: 'UWS-internship-offer-letter.pdf',
      width: 1655,
      height: 2340,
    },
  },
]

export const certifications: {
  title: string
  issuer: string
  /** As printed on the certificate; absent where it prints none. */
  date?: string
  credentialId?: string
  verify?: string
  thumb: string
  doc: Doc
}[] = [
  {
    title: 'Agents and Workflows',
    issuer: 'OpenAI Academy',
    date: 'June 26, 2026',
    credentialId: 'oolrwo30xo',
    thumb: '/credentials/openai-agents-and-workflows.webp',
    doc: {
      src: '/credentials/openai-agents-and-workflows.pdf',
      title: 'Agents and Workflows — OpenAI Academy certificate',
    },
  },
  {
    title: 'Claude Code 101',
    issuer: 'Anthropic',
    thumb: '/credentials/anthropic-claude-code-101.webp',
    doc: {
      src: '/credentials/anthropic-claude-code-101.pdf',
      title: 'Claude Code 101 — Anthropic certificate',
    },
  },
  {
    title: 'Machine Learning with Apache Spark',
    issuer: 'IBM · Coursera',
    date: 'October 20, 2024',
    verify: 'https://coursera.org/verify/QY85X1LQUPLZ',
    thumb: '/credentials/ibm-ml-with-apache-spark.webp',
    doc: {
      src: '/credentials/ibm-ml-with-apache-spark.pdf',
      title: 'Machine Learning with Apache Spark — IBM certificate',
    },
  },
]
