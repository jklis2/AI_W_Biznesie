import PageHeader from '@/components/ui/PageHeader';

export default function PrivacyPolicy() {
  return (
    <PageHeader backgroundImage="/headerBackgrounds/home.jpg" title="Privacy Policy">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
        <p className="mb-4">Last Updated: March 18, 2025</p>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">1. Introduction</h3>
          <p className="mb-3">
            Welcome to PC Store AI. We respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you 
            visit our website or use our services.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">2. Information We Collect</h3>
          <p className="mb-3">
            We may collect personal information that you voluntarily provide to us when you register on our website, 
            express interest in obtaining information about us or our products, or otherwise contact us.
          </p>
          <p className="mb-3">
            <strong>Personal Information:</strong> Name, email address, phone number, billing address, and payment information.
          </p>
          <p className="mb-3">
            <strong>Usage Data:</strong> Information about how you use our website, products, and services.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">3. How We Use Your Information</h3>
          <ul className="list-disc pl-6 mb-3">
            <li>To provide and maintain our service</li>
            <li>To process your purchases and transactions</li>
            <li>To send you order confirmations and updates</li>
            <li>To respond to your inquiries and provide customer support</li>
            <li>To send you marketing and promotional communications</li>
            <li>To improve our website and services</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">4. Cookies and Tracking Technologies</h3>
          <p className="mb-3">
            We use cookies and similar tracking technologies to track activity on our website and store certain information. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">5. Data Security</h3>
          <p className="mb-3">
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal 
            information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">6. Your Data Protection Rights</h3>
          <p className="mb-3">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="list-disc pl-6 mb-3">
            <li>The right to access, update, or delete your information</li>
            <li>The right to rectification</li>
            <li>The right to object to processing</li>
            <li>The right of restriction</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">7. Changes to This Privacy Policy</h3>
          <p className="mb-3">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page 
            and updating the &ldquo;Last Updated&rdquo; date.
          </p>
        </section>
        
        <section className="mb-6">
          <h3 className="text-xl font-semibold mb-2">8. Contact Us</h3>
          <p className="mb-3">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mb-3">
            Email: privacy@pcstoreai.com<br />
            Address: 123 Tech Street, Silicon Valley, CA 94043, USA
          </p>
        </section>
      </div>
    </PageHeader>
  );
}
