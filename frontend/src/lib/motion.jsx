import React from "react";
import { motion } from "framer-motion";

// Section fade/slide reveal
export const Reveal = ({ children, delay = 0, y = 40, className = "", ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
);

// Masked line-by-line text reveal
export const RevealText = ({ lines = [], className = "", lineClass = "", startDelay = 0, stagger = 0.12 }) => (
  <span className={className}>
    {lines.map((line, i) => (
      <span key={i} className="reveal-mask">
        <motion.span
          className={`block ${lineClass}`}
          initial={{ y: "110%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 1, delay: startDelay + i * stagger, ease: [0.22, 1, 0.36, 1] }}
        >
          {line}
        </motion.span>
      </span>
    ))}
  </span>
);

export const FadeIn = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1.2, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);
