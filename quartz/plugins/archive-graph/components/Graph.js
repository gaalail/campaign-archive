import { h } from "preact"
import graphScript from "./graph-script.js"

function GraphComponent({ cfg, fileData }) {
  const currentSlug = fileData.slug ?? ""
  const currentTitle = fileData.frontmatter?.title?.toString() ?? currentSlug

  return h(
    "section",
    {
      class: "archive-graph",
      "data-current-slug": currentSlug,
      "data-current-title": currentTitle,
      "aria-labelledby": "archive-graph-title",
    },
    [
      h("h3", { id: "archive-graph-title" }, "Graph View"),
      h("div", { class: "archive-graph-local", "aria-label": "Local page connections" }),
      h(
        "p",
        { class: "archive-graph-local-count", "aria-live": "polite" },
        "Loading nearby pages…",
      ),
      h("p", { class: "archive-graph-status", role: "status" }),
      h(
        "button",
        { class: "archive-graph-open", type: "button", disabled: true },
        "Loading graph…",
      ),
      h(
        "dialog",
        { class: "archive-graph-dialog", "aria-labelledby": "archive-graph-dialog-title" },
        [
          h("header", { class: "archive-graph-dialog-header" }, [
            h("div", {}, [
              h("h2", { id: "archive-graph-dialog-title" }, "Archive connections"),
              h(
                "p",
                {},
                "Explore authored page links by section. Generated collection membership is hidden by default.",
              ),
            ]),
            h(
              "button",
              { class: "archive-graph-close", type: "button", "aria-label": "Close graph" },
              "Close",
            ),
          ]),
          h("div", { class: "archive-graph-controls" }, [
            h("label", {}, [
              "Section",
              h("select", { class: "archive-graph-scope" }, [
                h("option", { value: "" }, "All sections"),
              ]),
            ]),
            h("label", { class: "archive-graph-search-label" }, [
              "Find a page",
              h("input", {
                class: "archive-graph-search",
                type: "search",
                autocomplete: "off",
                placeholder: "Title or path",
              }),
            ]),
            h("label", { class: "archive-graph-collection-label" }, [
              h("input", { class: "archive-graph-collections", type: "checkbox" }),
              "Include generated collection pages",
            ]),
            h("output", { class: "archive-graph-count", "aria-live": "polite" }),
          ]),
          h("div", { class: "archive-graph-legend", "aria-label": "Page sections" }),
          h("div", { class: "archive-graph-global" }),
          h(
            "p",
            { class: "archive-graph-help" },
            "Hover or focus a node to trace its links. Select a node to open that page. Use the mouse wheel or trackpad to zoom; drag the background to pan.",
          ),
        ],
      ),
    ],
  )
}

GraphComponent.css = `
.archive-graph {
  --archive-graph-border: var(--lightgray);
  --archive-graph-muted: var(--gray);
  --graph-edge: var(--gray);
}
.archive-graph h3 { font-size: 1rem; margin: 0 0 0.5rem; }
.archive-graph-local {
  width: 100%;
  height: 240px;
  border: 1px solid var(--archive-graph-border);
  border-radius: 6px;
  overflow: hidden;
}
.archive-graph-local svg, .archive-graph-global svg { display: block; width: 100%; height: 100%; }
.archive-graph-local-count, .archive-graph-status, .archive-graph-help {
  color: var(--archive-graph-muted);
  font-size: 0.8rem;
  margin: 0.35rem 0;
}
.archive-graph-status:empty { display: none; }
.archive-graph-open, .archive-graph-close {
  cursor: pointer;
  border: 1px solid var(--archive-graph-border);
  border-radius: 5px;
  background: var(--light);
  color: var(--dark);
  padding: 0.4rem 0.65rem;
}
.archive-graph-dialog {
  width: min(1100px, 94vw);
  height: min(820px, 92vh);
  max-width: none;
  max-height: none;
  padding: 1rem;
  border: 1px solid var(--archive-graph-border);
  border-radius: 10px;
  background: var(--light);
  color: var(--dark);
}
.archive-graph-dialog::backdrop { background: rgb(0 0 0 / 72%); backdrop-filter: blur(3px); }
.archive-graph-dialog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.archive-graph-dialog-header h2 { margin: 0; }
.archive-graph-dialog-header p { margin: 0.25rem 0 0.75rem; color: var(--archive-graph-muted); }
.archive-graph-controls {
  display: flex;
  align-items: end;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  margin-bottom: 0.75rem;
}
.archive-graph-controls label { display: flex; flex-direction: column; gap: 0.25rem; }
.archive-graph-controls select, .archive-graph-controls input[type="search"] {
  min-height: 2.25rem;
  max-width: 100%;
  border: 1px solid var(--archive-graph-border);
  border-radius: 4px;
  background: var(--light);
  color: var(--dark);
  padding: 0.3rem 0.5rem;
}
.archive-graph-controls .archive-graph-collection-label { flex-direction: row; align-items: center; }
.archive-graph-count { margin-left: auto; color: var(--archive-graph-muted); }
.archive-graph-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--archive-graph-muted);
  font-size: 0.75rem;
}
.archive-graph-legend-item { display: inline-flex; align-items: center; gap: 0.3rem; }
.archive-graph-legend-swatch { width: 0.65rem; height: 0.65rem; border-radius: 50%; }
.archive-graph-global {
  width: 100%;
  height: calc(100% - 190px);
  min-height: 300px;
  border: 1px solid var(--archive-graph-border);
  border-radius: 6px;
  overflow: hidden;
}
.archive-graph-node { cursor: pointer; outline: none; }
.archive-graph-node:focus circle { stroke: var(--dark); stroke-width: 2.5px; }
.archive-graph-label {
  fill: var(--dark);
  font-size: 11px;
  paint-order: stroke;
  stroke: var(--light);
  stroke-width: 3px;
  stroke-linejoin: round;
  pointer-events: none;
}
.archive-graph-empty {
  display: grid;
  height: 100%;
  place-items: center;
  color: var(--archive-graph-muted);
}
@media (max-width: 700px) {
  .archive-graph-dialog { width: 100vw; height: 100dvh; border-radius: 0; padding: 0.75rem; }
  .archive-graph-global { height: calc(100% - 300px); }
  .archive-graph-count { margin-left: 0; width: 100%; }
}
`
GraphComponent.afterDOMLoaded = graphScript

export function Graph() {
  return GraphComponent
}
