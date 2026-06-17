import React from 'react';
import { motion } from 'motion/react';
import { Globe, Figma, Zap, Layers } from 'lucide-react';

const SERVICES = [
  {
    title: 'Creative Direction',
    description: 'Defining the visual soul of your brand through cinematic design and storytelling.',
    icon: Globe
  },
  {
    title: 'Interface Design',
    description: 'High-fidelity UI systems that bridge the gap between aesthetics and functionality.',
    icon: Figma
  },
  {
    title: 'Web Development',
    description: 'Architecting fast, responsive, and secure digital products with modern tech stacks.',
    icon: Zap
  },
  {
    title: 'Experience Design',
    description: 'Mapping user journeys that are intuitive, delightful, and focused on conversion.',
    icon: Layers
  }
];

export default function Services() {
  return (
    <section id="services" aria-label="Services" className="py-32 bg-[#050505] text-white overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-8 uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              CRAFTING <br /> 
              SYSTEMS OF <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#00F0FF]">VALUE.</span>
            </h2>
            <p className="text-white/60 text-xl font-light leading-relaxed max-w-md">
              We specialize in deep design interventions that transform how people 
              interact with your brand across all digital touchpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
            {SERVICES.map((service, index) => (
              <motion.div 
                key={service.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#00F0FF]/10 group-hover:border-[#00F0FF]/30 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.2)] group-hover:-translate-y-2 transition-all duration-500">
                  <service.icon className="w-6 h-6 text-white group-hover:text-[#00F0FF] transition-colors" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4 uppercase tracking-wide">{service.title}</h3>
                <p className="text-white/50 font-light leading-relaxed">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
