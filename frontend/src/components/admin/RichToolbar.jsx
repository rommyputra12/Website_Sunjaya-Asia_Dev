import React from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import { TEXT_COLORS, splitAlign } from "../FormattedText";

const btn = "h-7 min-w-7 px-1.5 flex items-center justify-center border border-white/10 text-ash hover:text-copper hover:border-copper/60 transition-colors";

// Toolbar for a textarea: wraps the selection in markers or sets the field alignment.
// getEl returns the target textarea; apply(newValue) writes it back (keeps focus via preventDefault).
export const RichToolbar = ({ getEl, apply, testid }) => {
  const wrap = (open, close = open) => {
    const el = getEl(); if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    const sel = value.slice(s, e) || "teks";
    const next = value.slice(0, s) + open + sel + close + value.slice(e);
    apply(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + open.length, s + open.length + sel.length); });
  };
  const align = (a) => {
    const el = getEl(); if (!el) return;
    const { body } = splitAlign(el.value);
    apply(a === "left" ? body : `[align=${a}]${body}`);
  };
  const hold = (fn) => ({ onMouseDown: (ev) => { ev.preventDefault(); fn(); } });
  return (
    <div data-testid={`rich-toolbar-${testid}`} className="flex flex-wrap items-center gap-1 mb-1.5">
      <button type="button" title="Tebal" data-testid={`rt-bold-${testid}`} className={btn} {...hold(() => wrap("**"))}><Bold size={13} /></button>
      <button type="button" title="Miring" data-testid={`rt-italic-${testid}`} className={btn} {...hold(() => wrap("_"))}><Italic size={13} /></button>
      <button type="button" title="Garis bawah" data-testid={`rt-underline-${testid}`} className={btn} {...hold(() => wrap("++"))}><Underline size={13} /></button>
      <span className="w-px h-5 bg-white/10 mx-1" />
      {Object.entries(TEXT_COLORS).map(([id, c]) => (
        <button key={id} type="button" title={`Warna ${c.label}`} data-testid={`rt-color-${id}-${testid}`} className={btn} {...hold(() => wrap(`[c=${id}]`, "[/c]"))}>
          <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: c.value }} />
        </button>
      ))}
      <span className="w-px h-5 bg-white/10 mx-1" />
      {[["left", AlignLeft, "Rata kiri"], ["center", AlignCenter, "Rata tengah"], ["right", AlignRight, "Rata kanan"], ["justify", AlignJustify, "Rata kanan-kiri"]].map(([a, Icon, t]) => (
        <button key={a} type="button" title={t} data-testid={`rt-align-${a}-${testid}`} className={btn} {...hold(() => align(a))}><Icon size={13} /></button>
      ))}
    </div>
  );
};

export default RichToolbar;
