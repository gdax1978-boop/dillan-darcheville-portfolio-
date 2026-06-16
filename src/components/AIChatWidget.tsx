import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';


const SYSTEM_PROMPT = `You are Ava, a concise and friendly AI assistant embedded in Dillan Darcheville's portfolio website.

About Dillan:
- Full name: Dillan Darcheville
- Studio: Canvex Studio
- Location: New York, NY — serves clients globally
- Email: canvexstudio@gmail.com
- Book a free 30-min discovery call: https://calendly.com/canvexstudio/30min
- Services: Creative Direction, Interface Design, Web Development, Experience Design
- Average project turnaround: 2 weeks
- Stack: React, TypeScript, Tailwind CSS, modern web tech
- Projects: Lumina Real Estate, Volt Fitness, Osteria Roasters, Game Changers Gear
- Specialties: cinematic digital experiences, luxury brand aesthetics, conversion-optimized design

Your rules:
- Be warm, brief, and professional — max 2-3 sentences per reply unless detail is truly needed
- For pricing questions: "Pricing depends on project scope — book a free discovery call to get a tailored quote"
- For booking: always share the Calendly link https://calendly.com/canvexstudio/30min
- Never invent facts not listed above
- Encourage action: send a message or book a call
- If asked about turnaround: "Most projects are completed in about 2 weeks"`;

const SUGGESTIONS = [
  'What services do you offer?',
  'How long does a project take?',
  'Book a discovery call',
];

type Message = { role: 'user' | 'assistant'; text: string };

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: "Hi! I'm Ava 👋 Ask me anything about Dillan's services, projects, or how to get started." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_GROK_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
  const hasUserMessages = messages.some(m => m.role === 'user');

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, messages]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setSuggestionsVisible(false);
    setMessages(prev => [...prev, { role: 'user', text: trimmed }]);
    setInput('');
    setLoading(true);

    if (!apiKey) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "I'm not fully connected yet — reach Dillan directly at canvexstudio@gmail.com or book a call at calendly.com/canvexstudio/30min"
      }]);
      setLoading(false);
      return;
    }

    try {
      const chatMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(1).map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.text,
        })),
        { role: 'user', content: trimmed },
      ];

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: chatMessages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content;

      if (!reply) throw new Error(data.error?.message ?? 'Empty response');

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('[Ava]', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: "Something went wrong. Reach Dillan at canvexstudio@gmail.com or book a call at calendly.com/canvexstudio/30min"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div
          key="chat"
          className="chat-panel-enter w-[340px] max-h-[520px] flex flex-col rounded-2xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,240,255,0.15)] overflow-hidden"
          role="dialog"
          aria-label="Chat with Ava, Canvex Studio AI assistant"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#030303]/60 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]/30 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-[#00F0FF]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Ava</p>
                <p className="text-[10px] text-[#00F0FF]">Canvex Studio AI</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/40 hover:text-white transition-colors p-1 rounded focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
            aria-live="polite"
            aria-label="Chat messages"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm font-light leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#00F0FF] text-black rounded-br-sm'
                    : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start" aria-label="Ava is typing">
                <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {!hasUserMessages && suggestionsVisible && !loading && (
              <div className="flex flex-col gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left text-xs px-3.5 py-2 rounded-xl border border-[#00F0FF]/20 text-[#00F0FF] bg-[#00F0FF]/5 hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/40 transition-all focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/10 shrink-0">
            <form
              onSubmit={e => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:border-[#00F0FF]/40 transition-colors"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                aria-label="Type your message"
                disabled={loading}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="text-[#00F0FF] disabled:opacity-30 hover:scale-110 transition-transform focus-visible:ring-2 focus-visible:ring-[#00F0FF] rounded"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-[#00F0FF] text-black flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] hover:scale-105 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#030303]"
        aria-label={open ? 'Close AI chat' : 'Open AI chat assistant'}
        aria-expanded={open}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>
    </div>
  );
}
