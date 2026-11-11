import type { MetadataRoute } from 'next';

// Name and icons used when someone adds the site to a phone's home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Kesera Technologies',
    short_name: 'Kesera',
    description: 'Websites, apps and software for businesses, made in Zimbabwe.',
    start_url: '/',
    display: 'standalone',
    background_color: '#100e0c',
    theme_color: '#100e0c',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
