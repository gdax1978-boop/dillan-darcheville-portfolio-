import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { ExternalLink, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const PROJECTS = [
  {
    id: 1,
    title: 'Lumina Real Estate',
    category: 'Real Estate / Luxury',
    description: 'A premium real estate platform showcasing high-end properties with immersive galleries.',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1200',
    link: 'https://luxury-cobbler-beccc8.netlify.app/',
    span: 'col-span-1 md:col-span-2 row-span-2'
  },
  {
    id: 2,
    title: 'Volt Fitness',
    category: 'Fitness / Lifestyle',
    description: 'A dynamic fitness application for modern athletes with personalized workout plans.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200',
    link: 'https://resplendent-bonbon-288501.netlify.app/#home',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 3,
    title: 'Osteria Roasters',
    category: 'E-Commerce / Coffee',
    description: 'An artisanal coffee shop digital experience with seamless online ordering.',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=1200',
    link: 'https://serene-bombolone-4f49d1.netlify.app/brew',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 4,
    title: 'Game Changers Gear',
    category: 'E-Commerce / Sports',
    description: 'Custom, high-performance baseball and softball uniforms built for champions.',
    image: 'https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&q=80&w=1200',
    link: 'https://www.gamechangersgear.com/',
    span: 'col-span-1 md:col-span-2 row-span-1'
  },
];

function TiltCard({ children, className, onClick }: {
  children: React.ReactNode;
  className: string;
  onClick: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.transform = `perspective(1200px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) scale3d(1.02,1.02,1.02)`;
    cardRef.current.style.transition = 'transform 0.08s ease';
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
    cardRef.current.style.transition = 'transform 0.5s ease';
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();

  return (
    <section id="work" className="py-32 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6 uppercase">SELECTED WORK</h2>
          <p className="text-muted font-light text-lg">A curated collection of digital products and visual experiments that push the boundaries of the web.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
        {PROJECTS.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={project.span}
          >
            <TiltCard
              className="w-full h-full group relative overflow-hidden rounded-3xl bg-[#0A0A0A] border border-white/5 cursor-pointer hover:shadow-[0_0_40px_rgba(0,240,255,0.2)] transition-shadow duration-500"
              onClick={() => navigate(`/case-study/${project.id}`)}
            >
              <img
                src={project.image}
                alt={project.title}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
                width={1200}
                height={800}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

              <div className="absolute inset-0 p-8 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <span className="text-[#00F0FF] text-xs font-bold uppercase tracking-widest mb-2">{project.category}</span>
                <h3 className="text-white text-3xl font-display font-bold mb-4 uppercase drop-shadow-lg">{project.title}</h3>
                <p className="text-white/80 font-light text-sm mb-6 max-w-xs">{project.description}</p>
                <div className="flex items-center gap-4">
                  <a
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white text-black hover:scale-110 transition-transform focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
                    aria-label={`View ${project.title} Live Site`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <Link
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    to={`/case-study/${project.id}`}
                    className="p-3 rounded-full bg-black/50 backdrop-blur-md text-white border border-white/20 hover:scale-110 hover:border-[#00F0FF]/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all focus-visible:ring-2 focus-visible:ring-[#00F0FF]"
                    aria-label={`View ${project.title} Case Study`}
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
