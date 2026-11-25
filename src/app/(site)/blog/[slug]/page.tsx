import { notFound } from 'next/navigation';
import { Breadcrumbs, FaqList, JsonLd, LinkCards, Sections, WhatsAppBand } from '@/components/seo/blocks';
import { BLOG_POSTS, blogPost } from '@/content/seo/blog';
import { servicePage } from '@/content/seo/services';
import { abs, breadcrumbSchema, faqSchema, ORG_ID } from '@/lib/schema';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>) {
  const p = blogPost((await params).slug);
  if (!p) return {};
  return pageMetadata({ title: p.seoTitle, description: p.description, path: `/blog/${p.slug}`, type: 'article', published: p.published });
}

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default async function BlogPostPage({ params }: PageProps<'/blog/[slug]'>) {
  const p = blogPost((await params).slug);
  if (!p) notFound();
  const path = `/blog/${p.slug}`;
  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: p.title, path },
  ];
  const services = p.services.map((s) => servicePage(s)!).filter(Boolean);
  const others = BLOG_POSTS.filter((o) => o.slug !== p.slug).slice(0, 3);
  const article = {
    '@type': 'BlogPosting',
    '@id': `${abs(path)}#article`,
    headline: p.title,
    description: p.description,
    datePublished: p.published,
    dateModified: p.published,
    mainEntityOfPage: abs(path),
    image: abs('/opengraph-image.png'),
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  };

  return (
    <div className="paper pt-[68px]">
      <JsonLd nodes={[article, breadcrumbSchema(crumbs), ...(p.faqs?.length ? [faqSchema(p.faqs)] : [])]} />
      <article>
        <header className="shell pb-14 pt-12 md:pb-20 md:pt-16">
          <Breadcrumbs crumbs={crumbs} />
          <p className="t-label mt-10 text-ink/55">
            <time dateTime={p.published}>{date(p.published)}</time> · {p.minutes} min read
          </p>
          <h1 className="t-display-l mt-5 max-w-[22ch]">{p.title}</h1>
          <p className="t-lead mt-6 max-w-2xl text-ink/75">{p.lead}</p>
        </header>
        <div className="shell pb-20 md:pb-28">
          <Sections sections={p.sections} />
        </div>
      </article>
      <div className="shell space-y-20 pb-24 md:space-y-28 md:pb-36">
        {p.faqs?.length ? <FaqList faqs={p.faqs} /> : null}
        <LinkCards title="Services mentioned" links={services.map((s) => ({ href: `/services/${s.slug}`, label: s.name, text: s.description }))} />
        {others.length > 0 && <LinkCards title="Keep reading" links={others.map((o) => ({ href: `/blog/${o.slug}`, label: o.title, text: o.description }))} />}
        <WhatsAppBand message="Hi Kesera, I read your blog and have a question." heading="Want advice for your business?" />
      </div>
    </div>
  );
}
