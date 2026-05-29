/* Vercel-style: one bordered frame, + at each corner junction */

export default function GridFrame() {
  return (
    <div className="grid-frame" aria-hidden="true">
      <div className="grid-frame-box container">
        <span className="grid-frame-plus grid-frame-plus-tl" />
        <span className="grid-frame-plus grid-frame-plus-tr" />
        <span className="grid-frame-plus grid-frame-plus-bl" />
        <span className="grid-frame-plus grid-frame-plus-br" />
      </div>
    </div>
  );
}
