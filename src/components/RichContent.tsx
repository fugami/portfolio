import Markdown from "./Markdown";

/** Wrap runs of 2+ back-to-back images in a collage container so they lay out
 *  as a photo strip instead of stacking. An empty paragraph between images in
 *  the editor keeps them apart, so the author stays in control. */
function groupCollages(html: string): string {
  return html.replace(
    /(?:<img\b[^>]*>\s*){2,}/g,
    (run) => `<div class="collage">${run}</div>`
  );
}

/** Project bodies written in the rich editor are stored as HTML; entries from
 *  the old editor are Markdown. Render whichever this one is. */
export default function RichContent({ content }: { content: string }) {
  if (/^\s*</.test(content)) {
    return <div dangerouslySetInnerHTML={{ __html: groupCollages(content) }} />;
  }
  return <Markdown>{content}</Markdown>;
}
