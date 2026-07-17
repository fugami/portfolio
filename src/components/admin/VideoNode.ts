import { Node, mergeAttributes } from "@tiptap/core";

/** Minimal block node for uploaded video files: renders `<video controls src>`.
 *  (YouTube links are handled separately by @tiptap/extension-youtube.) */
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "true",
        playsinline: "true",
        preload: "metadata",
      }),
    ];
  },
});

export default Video;
