import React from "react";

// Renders "*text*" segments as copper accents; keeps line breaks
export const RichText = ({ text = "", accentClass = "text-copper" }) =>
  text.split("\n").map((line, li) => (
    <span key={li} className="block">
      {line.split(/(\*[^*]+\*)/g).map((seg, i) =>
        seg.startsWith("*") && seg.endsWith("*") && seg.length > 2
          ? <em key={i} className={`not-italic ${accentClass}`}>{seg.slice(1, -1)}</em>
          : <React.Fragment key={i}>{seg}</React.Fragment>
      )}
    </span>
  ));

export default RichText;
