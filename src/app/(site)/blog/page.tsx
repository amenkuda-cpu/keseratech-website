import Link from 'next/link';
import { Breadcrumbs, JsonLd, WhatsAppBand } from '@/components/seo/blocks';
import { BLOG_POSTS } from '@/content/seo/blog';
import { abs, breadcrumbSchema, ORG_ID } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Blog: Websites, Apps & AI for Zimbabwean Business',
  description: 'Straight answers for Zimbabwean business owners: website costs, online selling, AI chatbots and getting found on Google, from Kesera Technologies.',
  path: '/blog',
});

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.published.localeCompare(a.published));
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
  ];
  return (
    <div className="paper pt-[68px]">
      <JsonLd
        nodes={[
          { '@type': 'Blog', '@id': `${abs('/blog')}#blog`, url: abs('/blog'), name: 'Kesera Technologies Blog', publisher: { '@id': ORG_ID }, blogPost: posts.map((p) => ({ '@type': 'BlogPosting', headline: p.title, url: abs(`/blog/${p.slug}`), datePublished: p.published })) },
          breadcrumbSchema(crumbs),
        ]}
      />
      <section className="shell pb-14 pt-12 md:pb-20 md:pt-16" aria-labelledby="blog-title">
        <Breadcrumbs crumbs={crumbs} />
        <p className="t-label mt-10 text-ink/55">Blog</p>
        <h1 id="blog-title" className="t-display-l mt-5 max-w-[18ch]">
          Straight answers for Zimbabwean business owners.
        </h1>
        <p className="t-lead mt-6 max-w-2xl text-ink/75">What things cost, what actually works and how to get more customers online, in plain language.</p>
      </section>
      <div className="shell space-y-20 pb-24 md:pb-36">
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="lift group flex h-full flex-col rounded-[14px] border border-ink/12 bg-white/70 p-6 hover:border-ink/30">
                <span className="t-label text-ink/50">
                  {date(p.published)} · {p.minutes} min read
                </span>
                <h2 className="mt-4 text-[1.3rem] font-semibold leading-snug text-ink group-hover:text-signal">{p.title}</h2>
                <p className="mt-3 text-[0.97rem] leading-relaxed text-ink/65">{p.description}</p>
              </Link>
            </li>
          ))}
        </ul>
        <WhatsAppBand message="Hi Kesera, I have a question about getting my business online." heading="Have a question we have not answered?" />
      </div>
    </div>
  );
}
