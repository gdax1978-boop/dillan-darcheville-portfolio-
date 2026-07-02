"use client";
import { useEffect, useRef } from "react";
import { motion, useInView, useAnimationControls } from "motion/react";
import { cn } from "@/src/lib/utils";

interface TextGenerateEffectProps {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
}

export function TextGenerateEffect({ words, className, filter = true, duration = 0.5 }: TextGenerateEffectProps) {
  const wordsArray = words.split(" ");
  const controls = useAnimationControls();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return (
    <div ref={ref} className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className="leading-snug tracking-wide">
          {wordsArray.map((word, idx) => (
            <motion.span
              key={word + idx}
              variants={{
                hidden: { opacity: 0, filter: filter ? "blur(10px)" : "none" },
                visible: { opacity: 1, filter: filter ? "blur(0px)" : "none" },
              }}
              initial="hidden"
              animate={controls}
              transition={{ duration, delay: idx * 0.2 }}
              className="inline-block mr-1"
            >
              {word}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
