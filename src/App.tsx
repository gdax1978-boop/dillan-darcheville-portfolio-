import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

const CaseStudy     = lazy(() => import('./pages/CaseStudy'));
const BlogPost      = lazy(() => import('./pages/BlogPost'));
const BlogIndex     = lazy(() => import('./pages/BlogIndex'));
const FreeAudit       = lazy(() => import('./pages/FreeAudit'));
const TermsOfService  = lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy   = lazy(() => import('./pages/PrivacyPolicy'));
const CookieConsent = lazy(() => import('./components/CookieConsent'));
const AIChatWidget  = lazy(() => import('./components/AIChatWidget'));
const ScrollProgress = lazy(() => import('./components/ScrollProgress'));
const CursorGlow    = lazy(() => import('./components/CursorGlow'));

export default function App() {
  return (
    <Router>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#00F0FF] focus:text-black focus:rounded-full focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>
      <ScrollProgress />
      <CursorGlow />
      <div className="grain min-h-screen font-sans selection:bg-accent selection:text-black flex flex-col">
        <Header />
        <main id="main-content" className="flex-grow" tabIndex={-1}>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/case-study/:id" element={<CaseStudy />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/free-audit" element={<FreeAudit />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <CookieConsent />
        <AIChatWidget />
      </div>
    </Router>
  );
}
