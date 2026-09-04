import React from "react";
import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 40, className = "", once = true }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y, filter: "blur(10px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once, margin: "-80px" }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// Line-by-line masked reveal for hero
export const LineReveal = ({ text, className = "", delay = 0, stagger = 0.08 }) => {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="line-mask" style={{ marginRight: "0.28em" }}>
          <motion.span
            style={{ display: "inline-block", willChange: "transform" }}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{
              duration: 1.1,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
};

// Character-level reveal for shorter accent text
export const CharReveal = ({ text, className = "", delay = 0 }) => {
  const chars = Array.from(text);
  return (
    <span className={className}>
      {chars.map((c, i) => (
        <span key={i} className="line-mask">
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            transition={{ duration: 0.7, delay: delay + i * 0.02, ease: [0.22, 1, 0.36, 1] }}
          >
            {c === " " ? "\u00A0" : c}
          </motion.span>
        </span>
      ))}
    </span>
  );
};
