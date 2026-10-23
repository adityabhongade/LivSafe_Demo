import { useEffect } from 'react';

const SITE_URL = 'https://adityabhongade.github.io/LivSafe_Demo';

interface SEOProps {
  title: string;
  description: string;
  path: string;
  indexable?: boolean;
}

function setMeta(selector: string, attribute: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    const [key, name] = selector.match(/\[(name|property)="([^"]+)"\]/)?.slice(1) ?? [];
    if (key && name) element.setAttribute(key, name);
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

export function SEO({ title, description, path, indexable = false }: SEOProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`;
    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', indexable ? 'index, follow' : 'noindex, nofollow');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;
  }, [title, description, path, indexable]);

  return null;
}
