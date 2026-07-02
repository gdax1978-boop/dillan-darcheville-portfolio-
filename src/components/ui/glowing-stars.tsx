import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export function GlowingStarsBackgroundCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [mouseEntered, setMouseEntered] = useState(false);

  return (
    <div
      onMouseEnter={() => setMouseEntered(true)}
      onMouseLeave={() => setMouseEntered(false)}
      className={cn("bg-[linear-gradient(110deg,#333_0.6%,#222)] p-4 max-w-md max-h-[20rem] h-full w-full rounded-xl border border-[#eaeaea20] flex flex-col items-start justify-end", className)}
    >
      <div className="flex flex-row items-end gap-2 py-4">
        <GlowingStarsDisplay mouseEntered={mouseEntered} />
      </div>
      <div className="px-2 pb-6">{children}</div>
    </div>
  );
}

function GlowingStarsDisplay({ mouseEntered }: { mouseEntered: boolean }) {
  const stars = Array.from({ length: 108 }, (_, i) => i);
  const [glowingStars, setGlowingStars] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowingStars(Array.from({ length: 5 }, () => Math.floor(Math.random() * 108)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-48 p-1 w-full grid grid-cols-[repeat(18,1fr)] gap-[2px]">
      {stars.map((star, idx) => {
        const isGlowing = glowingStars.includes(idx);
        const delay = (idx % 10) * 0.1;

        return (
          <div key={`star-${idx}`} className="relative flex items-center justify-center">
            <motion.div
              key={`star-${idx}-${isGlowing}`}
              initial={{ scale: 1 }}
              animate={{ scale: isGlowing ? [1, 1.2, 2.5, 2.2, 3] : 1, background: isGlowing ? "#fff" : "#666" }}
              transition={{ duration: 2, ease: "easeInOut", delay }}
              className="h-[2px] w-[2px] rounded-full relative z-20"
            />
            {mouseEntered && (
              <motion.div
                key={`glow-${idx}`}
                initial={{ opacity: 0, scale: 1 }}
                animate={{ opacity: isGlowing ? [0, 1, 0] : 0, scale: isGlowing ? [1, 1.2, 2.5, 2.2, 3] : 1 }}
                transition={{ duration: 2, ease: "easeInOut", delay }}
                className="absolute left-1/2 -translate-x-1/2 z-10 h-[4px] w-[4px] rounded-full bg-blue-500 blur-[1px] shadow-2xl shadow-blue-400"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
