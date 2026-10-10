import type { Metadata } from 'next';
import { LegalPage } from '@/components/site/legal-page';
import { COMPANY } from '@/content/site';

export const metadata: Metadata = { title: 'Terms of use' };

// Plain-language starting point. Have it reviewed by a lawyer before launch.
export default function TermsPage() {
  return (
    <LegalPage title="Terms of use" updated="3 October 2026">
      <p>These terms apply to your use of this website, operated by {COMPANY.legal}.</p>
      <h2>Information on this website</h2>
      <p>
        We describe our products and projects as accurately as we can, including their development status. Products marked as in development, in research or coming soon are not yet available, and their features may change.
      </p>
      <h2>Prices and estimates</h2>
      <p>
        Published prices are in US dollars. Estimates from the project builder and the software estimator are indications only and are not offers. A project is agreed only in a written quote or contract.
      </p>
      <h2>Intellectual property</h2>
      <p>The content, design, logos and names on this website belong to Kesera or are used with permission. Please don’t reuse them without asking.</p>
      <h2>Liability</h2>
      <p>The website is provided as it is. We are not liable for losses arising from reliance on its content, to the extent the law allows.</p>
      <h2>Changes and contact</h2>
      <p>
        We may update these terms; the date above shows the latest version. Questions: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
    </LegalPage>
  );
}
