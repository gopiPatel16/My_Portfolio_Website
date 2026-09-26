import { createContext, useContext, type MouseEvent } from 'react'

/**
 * A document the on-site reader can show.
 *
 * `kind: 'image'` swaps the PDF frame for a picture — used for the resume,
 * which is shown as the page itself rather than in a viewer.
 * `download`: file name to save as; when set, the reader offers a Download
 * button, pointing at `downloadSrc` if the file to save is not the one shown.
 */
export type PreviewDoc = {
  src: string
  title: string
  kind?: 'pdf' | 'image'
  download?: string
  downloadSrc?: string
  /** Intrinsic pixels, for images: reserves the box before the file arrives. */
  width?: number
  height?: number
}

/**
 * Returns a click handler that opens a document in the on-site reader instead
 * of handing it to the browser. Call sites keep their own `<a href>`, so the
 * document is still a real link: middle-click, ctrl/cmd-click and "open in new
 * tab" all behave normally, and with scripting off the link simply works.
 *
 * Separate from the provider so the module exports only hooks and types —
 * mixing them with a component breaks fast refresh.
 */
export const PdfPreviewCtx = createContext<(doc: PreviewDoc) => (e: MouseEvent) => void>(
  () => () => {},
)

export const usePdfPreview = () => useContext(PdfPreviewCtx)
