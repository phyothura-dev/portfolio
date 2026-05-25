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

function toAbsoluteUrl(pathname = '/') {
  const base = getBaseUrl();
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(path, `${base}/`).toString();
}

export default function Seo({
  title = 'Phyo Thura (Thura) | Software Developer',
  description = 'Phyo Thura, also known as Thura, is a software developer building fast, accessible, and delightful web apps. Explore projects, skills, and contact details.',
  keywords = 'Phyo Thura, Thura, PhyoThura, Phyothura, Thura developer, software developer, web developer, React developer, portfolio',
  imagePath = '/Phyo.jpg',
  pathname = '/',
  noIndex = false,
}) {
  const canonicalUrl = toAbsoluteUrl(pathname);
  const absoluteImageUrl = toAbsoluteUrl(imagePath);
  const robots = noIndex ? 'noindex, nofollow' : 'index, follow';

  const structuredData = noIndex
    ? null
    : {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Phyo Thura',
        alternateName: ['Thura', 'Phyothura', 'PhyoThura'],
        url: toAbsoluteUrl('/'),
        image: toAbsoluteUrl('/Phyo.jpg'),
        jobTitle: 'Software Developer',
        sameAs: [
          'https://www.facebook.com/profile.php?id=100077023871140',
          'https://www.instagram.com/vik83124',
          'https://t.me/KP_Vv',
          'https://www.linkedin.com/in/phyothura',
          'https://github.com/phyothura-dev',
        ],
      };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Phyo Thura | Thura" />
      <meta property="og:image" content={absoluteImageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      {structuredData ? <script type="application/ld+json">{JSON.stringify(structuredData)}</script> : null}
    </Helmet>
  );
}

