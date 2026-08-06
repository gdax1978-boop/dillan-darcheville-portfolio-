import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  /** What was being looked for, e.g. "article" or "case study". */
  kind: string;
  backTo: string;
  backLabel: string;
}

/**
 * Shown when a dynamic route resolves to an id that does not exist.
 *
 * Previously /blog/99 and /case-study/99 rendered item 1 with a 200 status,
 * which Google records as a soft 404: a page that claims success while serving
 * content that does not match the URL. The matching useSEO() call marks these
 * noindex so they stay out of the index entirely.
 */
export default function NotFound({ kind, backTo, backLabel }: NotFoundProps) {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-[#030303] text-white">
      <div className="max-w-3xl mx-auto px-6 md:px-12">
        <p className="text-xs text-white/40 mb-6 font-medium uppercase tracking-widest">
          404
        </p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          This {kind} doesn&rsquo;t exist.
        </h1>
        <p className="text-white/60 text-lg mb-10 max-w-xl">
          The link may be out of date, or the address may have a typo in it.
        </p>
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-[#00F0FF] hover:gap-3 transition-all font-medium"
        >
          <ArrowLeft size={18} />
          {backLabel}
        </Link>
      </div>
    </main>
  );
}
