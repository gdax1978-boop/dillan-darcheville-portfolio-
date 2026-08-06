// Resolves a URL parameter to a post or case study.
//
// URLs moved from /blog/1 to /blog/glassmorphism-in-ui-design. Numeric ids are
// still accepted so old inbound links and anything already in Google's index
// keep working; vercel.json 301s them to the slug so only one URL is canonical.

import { POSTS } from './posts';
import { projectsData } from './caseStudies';

export function findPost(param: string | undefined) {
  if (!param) return undefined;
  const bySlug = Object.values(POSTS).find((p) => p.slug === param);
  return bySlug ?? POSTS[param];
}

export function findCaseStudy(param: string | undefined) {
  if (!param) return undefined;
  const bySlug = Object.values(projectsData).find((c) => c.slug === param);
  return bySlug ?? projectsData[param];
}
