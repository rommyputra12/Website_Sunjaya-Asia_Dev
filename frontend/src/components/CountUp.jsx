import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion, animate } from "framer-motion";

// Counts the first number inside a text (e.g. "USD 950 Million+") up from zero once visible
export const CountUp = ({ value, duration = 2, delay = 0, className, ...rest }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const m = String(value ?? "").match(/^(\D*?)(\d[\d,.]*)(.*)$/);
  const target = m ? parseFloat(m[2].replace(/,/g, "")) : 0;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!m || !inView) return;
    if (reduce) { setN(target); return; }
    const ctrl = animate(0, target, { duration, delay, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setN(v) });
    return () => ctrl.stop();
  }, [inView, target, reduce]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!m) return <span ref={ref} className={className} {...rest}>{value}</span>;
  const decimals = (m[2].split(".")[1] || "").length;
  const shown = n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span ref={ref} className={className} aria-label={value} {...rest}>
      {m[1]}{shown}{m[3]}
    </span>
  );
};
