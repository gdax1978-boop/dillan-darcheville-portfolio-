import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle, AlertCircle, CalendarDays, MessageSquare, ExternalLink } from 'lucide-react';
import emailjs from '@emailjs/browser';

type Tab = 'message' | 'schedule';

function CalendlyBookCard({ url }: { url: string }) {
  return (
    <div className="flex flex-col gap-8 p-10 rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-[#00F0FF]">Discovery Call</p>
        <p className="text-3xl font-display font-bold tracking-tight text-white">30 Minutes · Free</p>
        <p className="text-white/60 font-light mt-1">via Google Meet</p>
      </div>
      <ul className="flex flex-col gap-3 text-sm font-light text-white/70">
        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] shrink-0" />Discuss your project goals</li>
        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] shrink-0" />Get a tailored creative approach</li>
        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] shrink-0" />No commitment required</li>
      </ul>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-[#00F0FF] text-black rounded-full font-medium overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] focus-visible:ring-2 focus-visible:ring-white"
      >
        <CalendarDays className="w-4 h-4" />
        Choose a Time
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      </a>
    </div>
  );
}

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [activeTab, setActiveTab] = useState<Tab>('message');

  const calendlyUrl = (import.meta.env.VITE_CALENDLY_URL || 'https://calendly.com/your-username').trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus('sending');
    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_test',
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_test',
        formRef.current,
        { publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_test' }
      );
      setStatus('success');
      formRef.current.reset();
    } catch {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-32 px-6 md:px-12 bg-[#030303] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

          {/* Left column — headline + context */}
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tighter mb-8 uppercase"
            >
              LET'S <br /> COLLABORATE.
            </motion.h2>
            <p className="text-muted font-light text-xl leading-relaxed max-w-md">
              Have a project in mind? Send a message or book a discovery call directly on my calendar.
            </p>

            <div className="mt-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#00F0FF]" />
                <span className="text-sm font-light text-white/70">Message replies within 24 hours</span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-[#00F0FF]" />
                <span className="text-sm font-light text-white/70">30-min discovery calls available</span>
              </div>
            </div>
          </div>

          {/* Right column — tabbed panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-[#0A0A0A]/80 backdrop-blur-md rounded-full border border-white/10 mb-8 w-fit shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <button
                type="button"
                onClick={() => setActiveTab('message')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#00F0FF] ${
                  activeTab === 'message'
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Send a Message
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 focus-visible:ring-2 focus-visible:ring-[#00F0FF] ${
                  activeTab === 'schedule'
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Book a Call
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'message' && (
                <motion.div
                  key="message"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="from_name" className="text-xs font-bold uppercase tracking-widest text-white/60">Your Name</label>
                      <input
                        id="from_name"
                        type="text"
                        name="from_name"
                        required
                        placeholder="Jane Doe"
                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all font-light"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="from_email" className="text-xs font-bold uppercase tracking-widest text-white/60">Your Email</label>
                      <input
                        id="from_email"
                        type="email"
                        name="from_email"
                        required
                        placeholder="jane@example.com"
                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all font-light"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-white/60">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        placeholder="Tell me about your project..."
                        className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all font-light resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'sending' || status === 'success'}
                      className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-[#00F0FF] text-black rounded-full font-medium overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-[0_0_20px_rgba(0,240,255,0.2)] focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {status === 'idle' && (
                        <>Send Message <Send className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>
                      )}
                      {status === 'sending' && 'Sending…'}
                      {status === 'success' && (
                        <><CheckCircle className="w-4 h-4" /> Message Sent!</>
                      )}
                      {status === 'error' && (
                        <><AlertCircle className="w-4 h-4" /> Failed — Try Again</>
                      )}
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    </button>

                    <div aria-live="polite" aria-atomic="true" className="text-sm text-center">
                      {status === 'success' && (
                        <p className="text-[#00F0FF]">Your message is on its way — expect a reply within 24 hours.</p>
                      )}
                      {status === 'error' && (
                        <p role="alert" className="text-red-400">
                          Something went wrong. Email me directly at canvexstudio@gmail.com
                        </p>
                      )}
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div
                  key="schedule"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <CalendlyBookCard url={calendlyUrl} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
