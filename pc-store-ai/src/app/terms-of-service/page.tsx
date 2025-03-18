import PageHeader from '@/components/ui/PageHeader';

export default function TermsOfService() {
  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Terms of Service">
      <div className="mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
        <p className="mb-4">Last Updated: March 18, 2025</p>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">1. Introduction</h3>
          <p className="mb-3">
            Welcome to PC Store AI. These Terms of Service govern your use of our website and services. 
            By accessing or using our website, you agree to be bound by these Terms. If you disagree with any part of the terms, 
            you may not access the website.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">2. Definitions</h3>
          <ul className="list-disc pl-6 mb-3">
            <li><strong>Company</strong>: &ldquo;We&rdquo;, &ldquo;Us&rdquo; or &ldquo;Our&rdquo; refers to PC Store AI.</li>
            <li><strong>Customer</strong>: &ldquo;You&rdquo; or &ldquo;Your&rdquo; refers to the individual accessing or using our Service.</li>
            <li><strong>Website</strong>: PC Store AI website, accessible from www.pcstoreai.com</li>
            <li><strong>Service</strong>: Refers to the website, products, and services offered by PC Store AI.</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">3. User Accounts</h3>
          <p className="mb-3">
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
          </p>
          <p className="mb-3">
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">4. Products and Services</h3>
          <p className="mb-3">
            All products and services are subject to availability. We reserve the right to discontinue any product or service at any time.
            Prices for our products are subject to change without notice. We reserve the right to modify or discontinue the Service without notice at any time.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">5. Purchases</h3>
          <p className="mb-3">
            If you wish to purchase any product or service made available through the Service, you may be asked to supply certain information 
            relevant to your purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
          </p>
          <p className="mb-3">
            You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any purchase; 
            and that (ii) the information you supply to us is true, correct, and complete.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">6. Refunds and Returns</h3>
          <p className="mb-3">
            Our refund and returns policy is as follows:
          </p>
          <ul className="list-disc pl-6 mb-3">
            <li>Products can be returned within 30 days of receipt for a full refund.</li>
            <li>Products must be in their original condition and packaging.</li>
            <li>Shipping costs for returns are the responsibility of the customer unless the return is due to our error.</li>
            <li>Digital products and services are non-refundable once accessed or downloaded.</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">7. Intellectual Property</h3>
          <p className="mb-3">
            The Service and its original content, features, and functionality are and will remain the exclusive property of PC Store AI and its licensors.
            The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of PC Store AI.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">8. Limitation of Liability</h3>
          <p className="mb-3">
            In no event shall PC Store AI, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, 
            special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, 
            resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">9. Governing Law</h3>
          <p className="mb-3">
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">10. Changes to These Terms</h3>
          <p className="mb-3">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days&apos; notice prior to any new terms taking effect.
            What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">11. Contact Us</h3>
          <p className="mb-3">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mb-3">
            Email: legal@pcstoreai.com<br />
            Address: 123 Tech Street, Silicon Valley, CA 94043, USA
          </p>
        </section>
      </div>
    </PageHeader>
  );
}
