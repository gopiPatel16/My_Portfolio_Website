/**
 * Every field here is taken from the supplied paper, the EasyChair acceptance
 * email (21 June 2025) and the official ICCCNT presentation schedule. Nothing
 * is inferred. The paper was *accepted and scheduled for presentation*; no
 * claim is made about indexing or a published DOI, because nothing in the
 * supplied material states one.
 */
export const research = {
  title: 'AI-Based Approaches for Detecting Deepfake Audio Content',
  /**
   * Two authors, one of them named. The co-author's identity is deliberately
   * withheld — the credit stays accurate about the paper being co-authored and
   * about Gopi being second author, only the person stays private. Their name
   * is still printed on the PDF itself, which this site links to.
   */
  authors: [
    { label: 'Co-author', named: false },
    { label: 'Gopi Patel', named: true },
  ],
  affiliation:
    'Department of Data Science and Computer Application, Manipal Institute of Technology',
  venue: '16th International IEEE Conference on Computing, Communication and Networking Technologies',
  venueShort: 'IEEE ICCCNT 2025',
  host: 'IIT Indore, Madhya Pradesh, India',
  dates: '6–11 July 2025',
  paperId: '8711',
  status: 'Accepted',
  acceptedOn: '21 June 2025',
  slot: 'Day 5 · Slot 1 · 09:52 IST',
  keywords: ['Artificial intelligence', 'Deepfake', 'Deep learning', 'Neural networks'],

  abstract:
    'A systematic survey of AI-based methods for deepfake audio detection, covering both pipeline and end-to-end deep learning models. Approaches are evaluated on spectral and temporal characteristics — MFCCs, Mel spectrograms and CNN-LSTM hybrid networks — against standard datasets including the ASVspoof and ADD challenges.',

  /** Figures stated in the paper's own abstract and introduction. */
  scale: [
    { value: '47', label: 'Detection models evaluated' },
    { value: '11', label: 'Benchmark datasets' },
    { value: '38', label: 'Languages covered' },
    { value: '82', label: 'TTS architectures' },
  ],

  /** The three findings the paper itself names as its key results. */
  findings: [
    {
      n: '01',
      title: 'Self-supervised representations generalise further',
      body: 'HuBERT and Wav2Vec2 representations surpass spectral features by 19.7 mean accuracy in cross-corpora settings — but still fail against vocoder-free diffusion models.',
    },
    {
      n: '02',
      title: 'Adversarial training trades clean-speech precision',
      body: 'Noise-injected adversarial training improves robustness to compressed audio by a 32.4 EER reduction, at the cost of false positives on clean speech.',
    },
    {
      n: '03',
      title: 'Multimodal detection outperforms audio alone',
      body: 'Frameworks that add facial micro-gesture analysis reach 41.8% greater precision than audio-only systems, at high computational expense.',
    },
  ],

  conclusion:
    'Current systems achieve high precision under controlled conditions but degrade sharply against novel synthesis methods, environmental noise and adversarial manipulation. The paper argues for more diverse datasets, adaptive learning protocols and explainable detection frameworks — and proposes phase coherence patterns and prosodic distribution shifts as more robust discriminants than spectral discontinuities.',

  paperPdf: '/research/deepfake-audio-detection.pdf',
  acceptancePdf: '/research/icccnt-acceptance.pdf',
}
