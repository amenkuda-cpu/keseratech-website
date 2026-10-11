import type { Metadata } from 'next';
import { LegalPage } from '@/components/site/legal-page';
import { COMPANY } from '@/content/site';

export const metadata: Metadata = { title: 'Privacy notice', alternates: { canonical: '/legal/privacy' } };

// Plain-language starting point. Have it reviewed against Zimbabwe's Cyber and Data Protection Act before launch.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy notice" updated="3 October 2026">
      <p>This notice explains how {COMPANY.legal} (“Kesera”, “we”) handles personal information collected through this website.</p>
      <h2>What we collect</h2>
      <ul>
        <li>What you send us through the project builder or by email: your name, company, email address, phone number and project details.</li>
        <li>Basic technical information your browser sends when you visit, such as IP address and browser type, kept in server logs.</li>
      </ul>
      <h2>Why we use it</h2>
      <p>To reply to your enquiry, prepare estimates and quotes, and run and secure the website. We do not sell personal information or use it for unrelated marketing.</p>
      <h2>Who sees it</h2>
      <p>Kesera staff who handle enquiries, and service providers who host the website or deliver our email, under confidentiality obligations.</p>
      <h2>How long we keep it</h2>
      <p>Enquiries are kept for as long as needed to respond and for our business records, then deleted.</p>
      <h2>Your choices</h2>
      <p>
        You can ask to see, correct or delete the information we hold about you by emailing <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>
      <h2>Cookies</h2>
      <p>This website does not use advertising or tracking cookies. If analytics are added, this notice will be updated first.</p>
      <h2>Contact</h2>
      <p>
        {COMPANY.legal} · <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> · {COMPANY.phone}
      </p>
    </LegalPage>
  );
}
