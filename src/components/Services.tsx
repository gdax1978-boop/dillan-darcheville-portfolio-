import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Figma, Zap, Layers, ChevronDown } from 'lucide-react';

const SERVICES = [
  {
    title: 'Creative Direction',
    description: 'Defining the visual soul of your brand through cinematic design and storytelling. We craft the mood, palette, and narrative that make your brand instantly recognizable and emotionally resonant.',
    icon: Globe
  },
  {
    title: 'Interface Design',
    description: 'High-fidelity UI systems that bridge the gap between aesthetics and functionality. Every screen is designed with conversion, clarity, and brand cohesion as core constraints — not afterthoughts.',
    icon: Figma
  },
  {
    title: 'Web Development',
    description: 'Architecting fast, responsive, and secure digital products with modern tech stacks including React, TypeScript, Next.js, and Tailwind CSS. Built to perform at scale and rank in search.',
    icon: Zap
  },
  {
    title: 'Experience Design',
    description: 'Mapping user journeys that are intuitive, delightful, and focused on conversion. We analyze behavior, reduce friction, and design paths that naturally guide visitors toward your business goals.',
    icon: Layers
  }
];

const FAQS = [
  {
    q: 'How much does a web design project cost?',
    a: 'Project investment varies based on scope and complexity. A focused landing page or portfolio site typically starts at $2,500. Full brand and web builds range from $5,000 to $15,000+. Every engagement begins with a free 30-minute discovery call to scope your project accurately.'
  },
  {
    q: 'How long does a web design and development project take?',
    a: 'Most projects are completed within 2 weeks from kickoff to delivery. Complex builds with custom features, CMS integration, or e-commerce functionality may extend to 3–4 weeks. Timeline is confirmed before any work begins.'
  },
  {
    q: 'What services does Canvex Studio offer?',
    a: 'Canvex Studio offers Creative Direction, Interface Design, Web Development, and Experience Design. We handle the full digital build — from brand strategy and UI design to production-ready code and deployment.'
  },
  {
    q: 'Do you work with clients outside New York?',
    a: 'Yes. While Canvex Studio is based in New York, NY, we serve clients globally. The majority of our engagements are fully remote via Google Meet, Figma, and async collaboration tools.'
  },
  {
    q: 'What technologies do you use to build websites?',
    a: 'We build primarily with React, TypeScript, Next.js, Tailwind CSS, Framer Motion, and Vite. For e-commerce, we use Shopify and headless commerce stacks. CMS options include Contentful, Sanity, and Notion-based systems.'
  },
  {
    q: 'Can you redesign an existing website?',
    a: 'Absolutely. Redesigns are a core part of our work. We audit your current site for performance, conversion, and brand alignment, then rebuild with a clear strategy — not just a cosmetic refresh.'
  },
  {
    q: 'What makes Canvex Studio different from other web design agencies?',
    a: 'We combine cinematic design sensibility with engineering precision. Most studios do one or the other. We deliver pixel-perfect, production-grade work with a 2-week turnaround and a direct line to the designer and developer building your project — no account managers, no handoffs.'
  },
  {
    q: 'How do I get started with Canvex Studio?',
    a: 'Book a free 30-minute discovery call at calendly.com/canvexstudio/30min or send a message through the contact form on this site. We respond within 24 hours.'
  }
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-6 text-left gap-4 group focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none rounded"
        aria-expanded={open}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="text-white font-medium text-base md:text-lg group-hover:text-[#00F0FF] transition-colors">{q}</span>
        <ChevronDown className={`w-5 h-5 text-[#00F0FF] shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-answer-${index}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-white/60 font-light leading-relaxed pb-6 text-sm md:text-base">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Services() {
  return (
    <>
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

      <section id="faq" aria-label="Frequently Asked Questions" className="py-24 bg-[#030303] text-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="mb-16">
            <span className="text-[#00F0FF] text-xs font-bold uppercase tracking-widest mb-4 block">FAQ</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight uppercase">Common Questions</h2>
          </div>
          <div>
            {FAQS.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
