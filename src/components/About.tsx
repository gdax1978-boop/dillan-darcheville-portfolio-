import React, { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const SKILLS = [
  { name: 'UI / UX Design', level: 95 },
  { name: 'React & TypeScript', level: 92 },
  { name: 'Creative Direction', level: 90 },
  { name: 'Tailwind CSS', level: 94 },
  { name: 'Experience Design', level: 88 },
  { name: 'AI-Assisted Development', level: 85 },
];

function SkillBar({ name, level, index }: { name: string; level: number; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-light text-white/80">{name}</span>
        <motion.span
          className="text-xs font-bold text-[#00F0FF]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: index * 0.1 + 0.5 }}
        >
          {level}%
        </motion.span>
      </div>
      <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(to right, #00F0FF, #00A8B8)', boxShadow: '0 0 8px rgba(0,240,255,0.5)' }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : {}}
          transition={{ duration: 1.2, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="py-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-[#0A0A0A] border border-white/5 relative z-10">
            <img
              src="/dillan-profile.jpg"
              alt="Dillan Darcheville portrait"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#00F0FF]/15 rounded-full blur-[100px] -z-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-8 uppercase">
            BEYOND THE <br /> PIXELS.
          </h2>

          <div className="space-y-6 text-muted font-light text-lg leading-relaxed mb-12">
            <p>
              I am Dillan Darcheville, a digital designer and developer obsessed with the intersection of cinematic aesthetics and robust engineering. For over 2 years, I've been helping forward-thinking brands define their digital legacy.
            </p>
            <p>
              My design philosophy is simple: technology should feel invisible, while the experience should feel unforgettable. I believe in minimalism that doesn't compromise on character, and functionality that doesn't sacrifice beauty.
            </p>
          </div>

          {/* Animated skill bars */}
          <div className="flex flex-col gap-5 mb-12">
            <h3 className="font-bold uppercase tracking-widest text-xs text-white/50 mb-2">Proficiency</h3>
            {SKILLS.map((skill, i) => (
              <SkillBar key={skill.name} name={skill.name} level={skill.level} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
