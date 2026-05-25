import { Helmet } from 'react-helmet-async';

function normalizeBaseUrl(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  if (!trimmed) return null;

  try {
    const withProtocol = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function getBaseUrl() {
  const envBase = normalizeBaseUrl(import.meta.env.VITE_SITE_URL);
  if (envBase) return envBase;
  if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '');
  return 'https://thura.newway-solution.com';
}

function absoluteUrl(pathname = '/') {
  const base = getBaseUrl();
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(path, `${base}/`).toString();
}

export default function StructuredData() {
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Phyo Thura',
    url: absoluteUrl('/'),
    image: absoluteUrl('/Phyo.jpg'),
    jobTitle: 'Software Developer',
    alternateName: ['Thura', 'Phyothura', 'PhyoThura'],
    sameAs: [
      'https://www.facebook.com/profile.php?id=100077023871140',
      'https://www.instagram.com/vik83124',
      'https://t.me/KP_Vv',
      'https://www.linkedin.com/in/phyothura',
      'https://github.com/phyothura-dev',
    ],
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Phyo Thura | Thura',
    url: absoluteUrl('/'),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify([website, person])}</script>
    </Helmet>
  );
}
