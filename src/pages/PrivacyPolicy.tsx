import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useSEO } from '../lib/useSEO';

export default function PrivacyPolicy() {
  useSEO(
    'Privacy Policy | Canvex Studio',
    'How Canvex Studio collects, uses, and protects your personal information.',
    '/privacy'
  );

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <main className="min-h-screen bg-[#030303] text-white pt-36 pb-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-white/40 mb-12 font-medium uppercase tracking-widest">
          <Link to="/" className="hover:text-[#00F0FF] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-white/60">Privacy Policy</span>
        </nav>

        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tighter uppercase mb-4">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-16">Last updated: July 14, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-10 text-white/70 font-light leading-relaxed">

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">1. Overview</h2>
            <p>Canvex Studio ("we," "us," or "our"), operated by Dillan Darcheville, is committed to protecting your privacy. This Privacy Policy explains what information we collect, how we use it, and your rights regarding that information when you visit canvexstudio.com or engage our services.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">2. Information We Collect</h2>
            <p className="mb-3"><strong className="text-white/90">Information you provide directly:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Name and email address when you submit our contact form or book a discovery call</li>
              <li>Project details and business information you share during consultations</li>
              <li>Any files, assets, or materials you send us in the course of a project</li>
            </ul>
            <p className="mt-4 mb-3"><strong className="text-white/90">Information collected automatically:</strong></p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>Analytics data (pages visited, time on site, referral source) via privacy-respecting analytics tools</li>
              <li>Browser type, device type, and general location (country/region)</li>
              <li>Cookies necessary for the site to function correctly (see Section 6)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li>Respond to your inquiries and deliver our services</li>
              <li>Schedule discovery calls and manage project communication</li>
              <li>Send project updates, invoices, and relevant service information</li>
              <li>Improve the Site and our services based on aggregated usage data</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-4">We do not sell, rent, or trade your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">4. Third-Party Services</h2>
            <p>We use the following third-party tools that may process your data:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li><strong className="text-white/90">Calendly</strong>: for scheduling discovery calls. Subject to <a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#00F0FF] hover:underline">Calendly's Privacy Policy</a>.</li>
              <li><strong className="text-white/90">EmailJS</strong>: for processing contact form submissions.</li>
              <li><strong className="text-white/90">Vercel</strong>: for hosting. May log basic request metadata. Subject to <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#00F0FF] hover:underline">Vercel's Privacy Policy</a>.</li>
              <li><strong className="text-white/90">Unsplash / Mux</strong>: for media assets and video streaming used on the Site.</li>
            </ul>
            <p className="mt-4">Each of these services operates under its own privacy policy. We only use services that meet reasonable data protection standards.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">5. Data Retention</h2>
            <p>We retain personal information for as long as necessary to fulfill the purposes described in this policy, unless a longer retention period is required by law. Project-related communications are retained for a minimum of 3 years for business and tax purposes.</p>
            <p className="mt-3">You may request deletion of your personal data at any time by contacting us at <a href="mailto:canvexstudio@gmail.com" className="text-[#00F0FF] hover:underline">canvexstudio@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">6. Cookies</h2>
            <p>This Site uses cookies to:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li>Remember your cookie consent preference</li>
              <li>Collect anonymous analytics to improve the Site</li>
            </ul>
            <p className="mt-4">You can decline non-essential cookies using the cookie banner when you first visit the Site. Declining non-essential cookies does not affect the core functionality of the Site.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">7. Your Rights</h2>
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
              <li>The right to access the personal data we hold about you</li>
              <li>The right to correct inaccurate data</li>
              <li>The right to request deletion of your data</li>
              <li>The right to object to or restrict processing of your data</li>
              <li>The right to data portability (where applicable)</li>
            </ul>
            <p className="mt-4">To exercise any of these rights, contact us at <a href="mailto:canvexstudio@gmail.com" className="text-[#00F0FF] hover:underline">canvexstudio@gmail.com</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">8. Children's Privacy</h2>
            <p>This Site is not directed at children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately and we will take steps to delete it.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">9. Security</h2>
            <p>We take reasonable technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised "Last updated" date. We encourage you to review this page periodically.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-xl uppercase tracking-wide mb-4">11. Contact</h2>
            <p>For any privacy-related questions or requests, contact us at:</p>
            <address className="not-italic mt-3 space-y-1">
              <p className="text-white/80 font-medium">Canvex Studio / Dillan Darcheville</p>
              <p>New York, NY</p>
              <p><a href="mailto:canvexstudio@gmail.com" className="text-[#00F0FF] hover:underline">canvexstudio@gmail.com</a></p>
            </address>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row gap-4 text-sm text-white/40">
          <Link to="/terms" className="hover:text-[#00F0FF] transition-colors">Terms of Service</Link>
          <Link to="/" className="hover:text-[#00F0FF] transition-colors">← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}
