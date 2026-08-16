export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted mb-10">Last updated: April 11, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-body text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              Citisoft Solution ("we", "us", "our") operates the FixedDaam platform and is committed to
              protecting your personal information. This Privacy Policy explains what data we collect, how
              we use it, with whom we share it, and your rights regarding your personal data.
            </p>
            <p className="mt-2">
              By using FixedDaam, you consent to the practices described in this Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
            <h3 className="font-medium text-body mt-3 mb-1">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Account data</strong>, name, email address, password (stored hashed), and account type (Buyer or Merchant).</li>
              <li><strong>Business data (Merchants only)</strong>, business name, contact details, and product listings including descriptions, images, and prices.</li>
              <li><strong>Order data</strong>, products held, quantities, order statuses, delivery addresses, and pickup code identifiers.</li>
              <li><strong>Payment data</strong>, payment confirmations you send us over WhatsApp to verify transactions, and any screenshots submitted through the site before that flow changed. We do not store full card numbers or bank credentials.</li>
            </ul>

            <h3 className="font-medium text-body mt-4 mb-1">2.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Session tokens</strong>. JSON Web Tokens (JWTs) used to authenticate your session, stored securely.</li>
              <li><strong>Log data</strong>. IP address, browser type, pages visited, and timestamps for security and analytics purposes.</li>
              <li><strong>Device data</strong>, operating system, browser version, and device identifiers.</li>
            </ul>

            <h3 className="font-medium text-body mt-4 mb-1">2.3 Information We Do Not Collect</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>We do not collect biometric data.</li>
              <li>We do not collect sensitive personal data such as national identity numbers or medical records.</li>
              <li>We do not use third-party advertising trackers or sell your data to advertisers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To create and manage your account, including email verification and authentication.</li>
              <li>To facilitate price-lock transactions between Buyers and Merchants.</li>
              <li>To generate and validate QR codes for order collection.</li>
              <li>To send transactional emails (order confirmations, status updates, email verification).</li>
              <li>To detect, investigate, and prevent fraud or abuse on the Platform.</li>
              <li>To improve the Platform's features and user experience through anonymized analytics.</li>
              <li>To comply with legal obligations and enforce our Terms and Conditions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. How We Share Your Information</h2>
            <p>We do not sell your personal data. We share it only in the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Between Buyers and Merchants</strong>, when a price lock is created, the Merchant receives the Buyer's name and order details necessary to fulfill the order. Buyers see Merchant product and contact information.</li>
              <li><strong>Service providers</strong>, we use third-party services for cloud hosting, email delivery, and file storage. These providers process data on our behalf and are bound by confidentiality obligations.</li>
              <li><strong>Legal requirements</strong>, we may disclose your data if required by law, court order, or to protect the rights, property, or safety of Citisoft Solution, our users, or the public.</li>
              <li><strong>Business transfers</strong>, in the event of a merger, acquisition, or asset sale, your data may be transferred to the acquiring entity, who will be bound by this Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. QR Code Data</h2>
            <p>
              Each order generates a unique QR code tied to the Buyer's account and order details. QR codes
              are stored securely and are valid only for their associated order. They do not contain your
              payment information. Scanning a QR code reveals only the order identifier to the Merchant for
              fulfillment purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
            <p>
              We retain your account and order data for as long as your account is active or as needed to
              provide services. After account deletion, we may retain certain data for up to 90 days for
              legal, fraud prevention, and backup purposes, after which it is permanently deleted or
              anonymized. Transaction records may be retained for up to 7 years to comply with financial
              recordkeeping obligations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Data Security</h2>
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Passwords hashed using bcrypt before storage.</li>
              <li>Authentication via signed JWTs with expiration windows.</li>
              <li>HTTPS encryption for all data in transit.</li>
              <li>Rate limiting on authentication endpoints to prevent brute-force attacks.</li>
              <li>Restricted access to production databases.</li>
            </ul>
            <p className="mt-2">
              While we take reasonable precautions, no system is completely secure. You use the Platform
              at your own risk and are encouraged to use a strong, unique password.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Cookies and Local Storage</h2>
            <p>
              We use browser local storage and session cookies solely to maintain your authenticated session.
              We do not use marketing or analytics cookies from third parties. You may clear your browser
              storage at any time, which will log you out of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Access</strong>, request a copy of the personal data we hold about you.</li>
              <li><strong>Rectification</strong>, request correction of inaccurate or incomplete data.</li>
              <li><strong>Erasure</strong>, request deletion of your personal data, subject to legal retention obligations.</li>
              <li><strong>Restriction</strong>, request that we limit how we process your data.</li>
              <li><strong>Portability</strong>, receive your data in a structured, commonly used format.</li>
              <li><strong>Objection</strong>, object to certain types of processing.</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:privacy@fixeddaam.com" className="text-blue-600 hover:underline">
                privacy@fixeddaam.com
              </a>
              . We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Children's Privacy</h2>
            <p>
              FixedDaam is not directed at individuals under the age of 18. We do not knowingly collect
              personal data from minors. If we become aware that a minor has provided us with personal data,
              we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes
              via email or a notice on the Platform. The "Last updated" date at the top of this page
              reflects the most recent revision. Continued use of the Platform after changes constitutes
              your acceptance of the updated Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Contact Us</h2>
            <p>For privacy-related inquiries or to exercise your rights:</p>
            <address className="not-italic mt-2 space-y-1">
              <p><strong>Citisoft Solution. Data Privacy</strong></p>
              <p>
                Email:{" "}
                <a href="mailto:privacy@fixeddaam.com" className="text-blue-600 hover:underline">
                  privacy@fixeddaam.com
                </a>
              </p>
            </address>
          </section>

        </div>
      </div>
    </div>
  );
}
