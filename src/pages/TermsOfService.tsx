import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useSEO } from '../lib/useSEO';

export default function TermsOfService() {
  useSEO(
    'Terms of Service | Canvex Studio',
    'Terms and conditions governing the use of Canvex Studio services and website.',
    '/terms'
  );

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-screen bg-[#030303] text-white pt-36 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/40 mb-12 font-medium uppercase tracking-widest">
          <Link to="/" className="hover:text-[#00F0FF] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">Terms of Service</span>
        </nav>

        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-4">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-16">Last updated: July 14, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-white/70 font-light leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">1. Agreement to Terms</h2>
            <p>By accessing or using the website located at canvexstudio.com ("Site") or engaging Canvex Studio ("we," "us," or "our") for design or development services, you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site or our services.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">2. Services</h2>
            <p>Canvex Studio provides web design, web development, creative direction, and experience design services. Specific deliverables, timelines, payment terms, and intellectual property arrangements are defined in individual project agreements or statements of work signed between Canvex Studio and the client.</p>
            <p className="mt-3">These Terms of Service govern use of the Site and form a general baseline for all client engagements. Where a signed project agreement conflicts with these Terms, the project agreement takes precedence.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">3. Intellectual Property</h2>
            <p>All content on this Site (including text, graphics, code, video, and design) is the property of Dillan Darcheville / Canvex Studio and is protected by applicable copyright and intellectual property laws.</p>
            <p className="mt-3">You may not reproduce, distribute, modify, or create derivative works from any content on this Site without prior written permission.</p>
            <p className="mt-3">Upon full payment for a project, clients receive ownership of final deliverables as specified in their project agreement. Canvex Studio retains the right to display work in its portfolio unless otherwise agreed in writing.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">4. Payment Terms</h2>
            <p>All project fees are outlined in individual proposals or agreements. Unless otherwise stated, a deposit is required before work begins, with the remaining balance due upon project completion before final files are transferred.</p>
            <p className="mt-3">Late payments may result in project pauses. Canvex Studio reserves the right to withhold delivery of final assets until payment is received in full.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">5. Limitation of Liability</h2>
            <p>To the maximum extent permitted by applicable law, Canvex Studio shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of revenue, data, or profits, arising from your use of the Site or our services.</p>
            <p className="mt-3">Our total liability to you for any claim arising from services rendered shall not exceed the total amount paid by you to Canvex Studio in the three (3) months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">6. Disclaimer of Warranties</h2>
            <p>The Site and all information on it are provided "as is" without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">7. Third-Party Links</h2>
            <p>This Site may contain links to third-party websites. Canvex Studio has no control over and assumes no responsibility for the content, privacy policies, or practices of any third-party sites. We encourage you to review the terms and privacy policies of any site you visit.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">8. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in New York, NY.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">9. Changes to Terms</h2>
            <p>We reserve the right to update these Terms at any time. Changes will be posted on this page with a revised "Last updated" date. Continued use of the Site following any changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">10. Contact</h2>
            <p>Questions about these Terms? Reach us at <a href="mailto:canvexstudio@gmail.com" className="text-[#00F0FF] hover:underline">canvexstudio@gmail.com</a>.</p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 text-sm text-white/40">
          <Link to="/privacy" className="hover:text-[#00F0FF] transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-[#00F0FF] transition-colors">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
