import React from "react";

// Lightweight CMS formatting: **bold**, _italic_, ++underline++, [c=copper]colour[/c], *accent*,
// optional "[align=left|right|center|justify]" prefix for the whole field.
export const TEXT_COLORS = {
  copper: { label: "Oranye", value: "#C86230" },
  ivory: { label: "Gading (untuk latar gelap)", value: "#F3EAD3" },
  sky: { label: "Biru muda", value: "#7FC8EE" },
  gray: { label: "Abu (untuk latar gelap)", value: "#9AA6AE" },
};

const ALIGN_RE = /^\[align=(left|right|center|justify)\]\s*/;
const TOKEN = /\*\*([\s\S]+?)\*\*|\+\+([\s\S]+?)\+\+|(?<![\w*])_(?!\s)([^_\n]+?)(?<!\s)_(?!\w)|(?<![\w*])\*(?![\s*])([^*\n]+?)(?<!\s)\*(?![\w*])/;

export const splitAlign = (text = "") => {
  const m = String(text || "").match(ALIGN_RE);
  return { align: m?.[1], body: m ? String(text).slice(m[0].length) : String(text || "") };
};

export const stripFormatting = (text = "") =>
  splitAlign(text).body.replace(/\*\*|\+\+|\[c=#?\w+\]|\[\/c\]/g, "").replace(/(?<![\w*])[_*](?!\s)([^_*\n]+?)(?<!\s)[_*](?![\w*])/g, "$1");

// Colour tags may nest, so their closing [/c] is found by depth instead of by regex
const COLOR_OPEN = /\[c=(#[0-9a-fA-F]{6}|\w+)\]/;
const colorToken = (str) => {
  const o = str.match(COLOR_OPEN);
  if (!o) return null;
  const tag = /\[c=(?:#[0-9a-fA-F]{6}|\w+)\]|\[\/c\]/g;
  tag.lastIndex = o.index + o[0].length;
  let depth = 1, t;
  while ((t = tag.exec(str))) {
    depth += t[0] === "[/c]" ? -1 : 1;
    if (!depth) {
      const whole = str.slice(o.index, t.index + 4);
      return Object.assign([whole], { index: o.index, color: o[1], inner: str.slice(o.index + o[0].length, t.index) });
    }
  }
  return null;
};
const nextToken = (str) => {
  const m = str.match(TOKEN), c = colorToken(str);
  if (!m) return c;
  if (!c) return m;
  return c.index <= m.index ? c : m;
};

const inline = (str, accentClass, key = "r") => {
  const out = [];
  let rest = str, n = 0;
  while (rest) {
    const m = nextToken(rest);
    if (!m) { out.push(rest); break; }
    if (m.index) out.push(rest.slice(0, m.index));
    const k = `${key}-${n++}`;
    if (m.color) out.push(<span key={k} style={{ color: m.color.startsWith("#") ? m.color : TEXT_COLORS[m.color]?.value }}>{inline(m.inner, accentClass, k)}</span>);
    else if (m[1] !== undefined) out.push(<strong key={k} className="font-bold">{inline(m[1], accentClass, k)}</strong>);
    else if (m[2] !== undefined) out.push(<span key={k} className="underline underline-offset-[3px] decoration-1">{inline(m[2], accentClass, k)}</span>);
    else if (m[3] !== undefined) out.push(<em key={k} className="italic">{inline(m[3], accentClass, k)}</em>);
    else out.push(<em key={k} className={`not-italic ${accentClass}`}>{m[4]}</em>);
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
};

// Inline renderer for text that already sits inside a <p>/<div>; line breaks become <br/>
// inline: ignore alignment (caller aligns the parent so following inline content stays on the same line)
export const Fmt = ({ text, accentClass = "text-copper", inline: inlineOnly = false }) => {
  const { align, body } = splitAlign(text);
  const lines = body.split("\n");
  const nodes = lines.map((l, i) => <React.Fragment key={i}>{i > 0 && <br />}{inline(l, accentClass, `l${i}`)}</React.Fragment>);
  return align && !inlineOnly ? <span className="block" style={{ textAlign: align }}>{nodes}</span> : <>{nodes}</>;
};

export default Fmt;
