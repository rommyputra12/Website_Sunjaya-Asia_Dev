import React from "react";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import { TEXT_COLORS, splitAlign } from "../FormattedText";

const btn = "h-7 min-w-7 px-1.5 flex items-center justify-center border border-white/10 text-ash hover:text-copper hover:border-copper/60 transition-colors";

// Toolbar for a textarea: wraps the selection in markers or sets the field alignment.
// getEl returns the target textarea; apply(newValue) writes it back (keeps focus via preventDefault).
export const RichToolbar = ({ getEl, apply, testid }) => {
  const sel = React.useRef(null);
  // Native "change" fires once when the picker closes (React onChange would fire on every drag step)
  const pickRef = React.useRef();
  pickRef.current = (hex) => { const el = getEl(); if (el && sel.current) el.setSelectionRange(...sel.current); wrap(`[c=${hex.toUpperCase()}]`, "[/c]"); };
  const pickColor = (hex) => pickRef.current(hex);
  const wrap = (open, close = open) => {
    const el = getEl(); if (!el) return;
    const { value } = el;
    // never wrap inside the "[align=…]" prefix
    const lock = value.length - splitAlign(value).body.length;
    let s = Math.max(el.selectionStart, lock), e = Math.max(el.selectionEnd, lock);
    // snap selection edges out of existing markers so tags are never split
    for (const mk of value.matchAll(/\*\*|\+\+|\[c=[^\]]*\]|\[\/c\]/g)) {
      const a0 = mk.index, a1 = mk.index + mk[0].length;
      if (s > a0 && s < a1) s = a0;
      if (e > a0 && e < a1) e = a1;
    }
    const isColor = open.startsWith("[c=");
    if (isColor) {
      // re-colouring replaces the old colour instead of nesting a second one
      for (;;) {
        const before = value.slice(0, s).match(/\[c=[^\]]*\]$/), after = value.slice(e).startsWith("[/c]");
        if (!before || !after) break;
        s -= before[0].length; e += 4;
      }
    }
    let sel = value.slice(s, e) || "teks";
    if (isColor) sel = sel.replace(/\[c=[^\]]*\]|\[\/c\]/g, "");
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
      <label title="Pilih warna lain (semua warna)" data-testid={`rt-color-custom-${testid}`} className={`${btn} relative cursor-pointer gap-1`}
        onMouseDown={() => { const el = getEl(); if (el) sel.current = [el.selectionStart, el.selectionEnd]; }}>
        <span className="w-3.5 h-3.5 rounded-full border border-white/30" style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }} />
        <span className="font-mono text-[9px]">Lainnya</span>
        <input type="color" defaultValue="#C86230" data-testid={`rt-color-picker-${testid}`} className="absolute inset-0 opacity-0 cursor-pointer"
          ref={(inp) => { if (inp && !inp.dataset.bound) { inp.dataset.bound = "1"; inp.addEventListener("change", () => pickColor(inp.value)); } }} />
      </label>
      <span className="w-px h-5 bg-white/10 mx-1" />
      {[["left", AlignLeft, "Rata kiri"], ["center", AlignCenter, "Rata tengah"], ["right", AlignRight, "Rata kanan"], ["justify", AlignJustify, "Rata kanan-kiri"]].map(([a, Icon, t]) => (
        <button key={a} type="button" title={t} data-testid={`rt-align-${a}-${testid}`} className={btn} {...hold(() => align(a))}><Icon size={13} /></button>
      ))}
    </div>
  );
};

export default RichToolbar;
