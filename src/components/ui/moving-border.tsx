import React, { useRef } from "react";
import { motion, useAnimationFrame, useMotionTemplate, motionValue, useTransform } from "motion/react";
import type { MotionValue } from "motion/react";
import { cn } from "@/src/lib/utils";

interface MovingBorderProps {
  children: React.ReactNode;
  duration?: number;
  className?: string;
  containerClassName?: string;
  borderClassName?: string;
  as?: React.ElementType;
  [key: string]: unknown;
}

export function MovingBorder({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  as: Component = "button",
  ...props
}: MovingBorderProps) {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = motionValue<number>(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength?.() ?? 0;
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val)?.x ?? 0);
  const y = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val)?.y ?? 0);
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <Component className={cn("relative h-16 w-40 overflow-hidden rounded-full p-[1px] text-xl", containerClassName)} {...props}>
      <div className="absolute inset-0" style={{ borderRadius: "inherit" }}>
        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="absolute h-full w-full" width="100%" height="100%">
          <rect fill="none" width="100%" height="100%" rx="100" ry="100" ref={pathRef} />
        </svg>
        <motion.div
          style={{ position: "absolute", top: 0, left: 0, display: "inline-block", transform }}
          className={cn("h-20 w-20 opacity-[0.8]", borderClassName)}
        >
          <div className="h-full w-full rounded-full bg-[radial-gradient(var(--sky-500)_40%,transparent_60%)]" />
        </motion.div>
      </div>
      <div className={cn("relative flex h-full w-full items-center justify-center rounded-full bg-slate-900/[0.8] text-sm font-medium text-white antialiased backdrop-blur-xl", className)}>
        {children}
      </div>
    </Component>
  );
}
