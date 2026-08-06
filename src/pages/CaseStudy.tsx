import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { useSEO } from '../lib/useSEO';
import { projectsData } from '../data/caseStudies';
import { findCaseStudy } from '../data/lookup';
import { caseStudySchemas } from '../data/schemas';
import NotFound from '../components/NotFound';

export default function CaseStudy() {
  const { id } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const found = findCaseStudy(id);
  const notFound = !found;
  const caseStudy = found ?? projectsData['1'];

  const [breadcrumbSchema, caseStudySchema] = caseStudySchemas(caseStudy);

  useSEO(
    notFound
      ? 'Case Study Not Found | Canvex Studio'
      : `${caseStudy.title} Case Study | Canvex Studio`,
    notFound
      ? 'This case study could not be found. Browse selected work by Canvex Studio, New York.'
      : caseStudy.metaDescription,
    notFound ? undefined : `/case-study/${caseStudy.slug}`,
    notFound ? undefined : [breadcrumbSchema, caseStudySchema],
    notFound ? undefined : caseStudy.image,
    'article',
    notFound
  );

  if (notFound) {
    return <NotFound kind="case study" backTo="/#work" backLabel="Back to selected work" />;
  }

  return (
    <main className="min-h-screen pt-32 pb-20 bg-[#030303] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/40 mb-6 font-medium uppercase tracking-widest">
          <Link to="/" className="hover:text-[#00F0FF] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/#work" className="hover:text-[#00F0FF] transition-colors">Work</Link>
          <span>/</span>
          <span className="text-white/60">{caseStudy.title}</span>
        </nav>

        <Link to="/#work" className="inline-flex items-center gap-2 text-white/60 hover:text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all mb-8 uppercase tracking-widest text-xs font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tighter mb-8 uppercase text-white">
            {caseStudy.title}
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16 pt-8 border-t border-white/10">
            <div>
              <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-2">Client</p>
              <p className="font-medium text-sm text-white/80">{caseStudy.client}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-2">Role</p>
              <p className="font-medium text-sm text-white/80">{caseStudy.role}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-2">Duration</p>
              <p className="font-medium text-sm text-white/80">{caseStudy.duration}</p>
            </div>
            <div>
              <p className="font-bold uppercase tracking-widest text-[10px] text-white/50 mb-2">Live Link</p>
              <a href={caseStudy.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-sm text-[#00F0FF] hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all">
                View Site <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full h-[60vh] md:h-[80vh] mb-20"
      >
        <img src={caseStudy.image} alt={`${caseStudy.title}, Canvex Studio project`} className="w-full h-full object-cover" loading="eager" decoding="async" />
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-20 relative z-10">
        <section>
          <h2 className="text-2xl font-display font-bold mb-6 uppercase text-white">Overview</h2>
          <p className="text-white/70 font-light text-lg leading-relaxed">{caseStudy.overview}</p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-6 uppercase text-white">The Challenge</h2>
          <p className="text-white/70 font-light text-lg leading-relaxed">{caseStudy.challenge}</p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-6 uppercase text-white">The Solution</h2>
          <p className="text-white/70 font-light text-lg leading-relaxed">{caseStudy.solution}</p>
        </section>

        <section>
          <h2 className="text-2xl font-display font-bold mb-8 uppercase text-white">Key Results</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {caseStudy.results.map((result: string, idx: number) => (
              <li key={idx} className="bg-[#0A0A0A]/80 backdrop-blur-md border border-white/10 p-8 rounded-2xl flex items-center justify-center text-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <span className="font-display font-bold text-xl uppercase text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.3)]">{result}</span>
              </li>
            ))}
          </ul>
        </section>

        {caseStudy.techStack && caseStudy.techStack.length > 0 && (
          <section>
            <h2 className="text-2xl font-display font-bold mb-8 uppercase text-white">Tech Stack</h2>
            <div className="flex flex-wrap gap-4">
              {caseStudy.techStack.map((tech: string, idx: number) => (
                <span key={idx} className="px-6 py-3 rounded-full border border-white/20 text-white/80 font-medium text-sm tracking-wide bg-white/5 hover:bg-white/10 transition-colors shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="pt-8 border-t border-white/10">
          <p className="text-white/50 text-sm font-light mb-6">Ready to build something like this?</p>
          <Link
            to="/#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#00F0FF] text-black rounded-full font-medium hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all"
          >
            Start a Project
          </Link>
        </section>
      </div>
    </main>
  );
}
