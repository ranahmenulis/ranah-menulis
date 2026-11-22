/**
 * The document as flowing text: its title, then the body HTML the editor produced. Used both for
 * measuring where pages break and for drawing each page, so the two always look the same. The HTML
 * comes from the live editor (`editor.getHTML()`), which escapes all text.
 */
export function FlowContent({ title, html }: { title: string; html: string }) {
  return (
    <div className="studio-flow">
      {title.trim() && (
        <div className="studio-title text-ink-read" style={{ marginBottom: "1em" }}>
          {title}
        </div>
      )}
      <div
        className="studio-prose"
        style={{ minHeight: 0 }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
