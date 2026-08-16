export function TermsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms and Conditions</h1>
        <p className="text-sm text-muted mb-10">Last updated: April 11, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-body text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
            <p>
              Welcome to <strong>FixedDaam</strong> ("the Platform", "we", "us", or "our"), a price-locking
              marketplace operated by Citisoft Solution. By registering an account, accessing, or using the
              Platform in any capacity, you ("User", "Buyer", or "Merchant") agree to be bound by these Terms
              and Conditions ("Terms"). If you do not agree to these Terms, you must not use the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Definitions</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Buyer</strong>, a registered user who browses products and locks in prices.</li>
              <li><strong>Merchant</strong>, a registered business that lists products and fulfills orders.</li>
              <li><strong>Price Lock</strong>, a commitment by the Buyer to purchase a product at the price displayed at the time of locking, and a commitment by the Merchant to honor that price.</li>
              <li><strong>Order</strong>, a Price Lock transaction initiated by a Buyer, identified by a unique QR code.</li>
              <li><strong>QR Code</strong>, a unique scannable code issued to the Buyer upon locking a price, used for order collection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. Eligibility</h2>
            <p>
              You must be at least 18 years of age to use the Platform. By creating an account, you
              represent and warrant that you are of legal age and that all information you provide is
              accurate and complete. We reserve the right to suspend or terminate accounts found to
              be in violation of this requirement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Account Registration</h2>
            <p>
              To use the Platform, you must register an account and verify your email address. You are
              responsible for maintaining the confidentiality of your login credentials and for all
              activity that occurs under your account. You agree to notify us immediately at
              <strong> support@fixeddaam.com</strong> if you suspect any unauthorized use of your account.
            </p>
            <p className="mt-2">
              Merchants must register as a "business" account type. Providing false business information
              is a material breach of these Terms and may result in immediate account termination.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Price Locking Mechanism</h2>
            <p>
              When a Buyer locks a price on a product, a binding order is created between the Buyer and
              the Merchant at the displayed price. The following order lifecycle applies:
            </p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li><strong>Locked</strong>, the Buyer has committed to the price; the Merchant is notified.</li>
              <li><strong>Ready</strong>, the Merchant has prepared the order for collection.</li>
              <li><strong>Delivered</strong>, the Buyer has collected the order using their QR code.</li>
            </ol>
            <p className="mt-2">
              A locked price is a binding commitment. Neither party may unilaterally cancel a confirmed order
              except as provided in Section 7 (Cancellations and Refunds).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. Buyer Obligations</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Buyers must complete payment at the time of placing a price lock, as required by the Platform.</li>
              <li>Buyers must present their QR code when collecting an order.</li>
              <li>Buyers must not share, transfer, or duplicate QR codes.</li>
              <li>Buyers acknowledge that price locks are made in good faith and that the Platform is not responsible for Merchant inventory errors beyond what is provided in Section 7.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. Merchant Obligations</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Merchants must honor locked prices for all confirmed orders.</li>
              <li>Merchants must keep product listings, prices, and inventory levels accurate and up to date.</li>
              <li>Merchants must update order statuses promptly as goods are prepared and collected.</li>
              <li>Merchants are solely responsible for the quality, safety, legality, and description accuracy of their products.</li>
              <li>Merchants must not list counterfeit, prohibited, or illegal goods.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. Cancellations and Refunds</h2>
            <p>
              Because the core value of FixedDaam is price certainty, cancellations are strictly limited:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Buyers may request a cancellation only if the Merchant fails to fulfill the order within the agreed timeframe.</li>
              <li>Merchants may request a cancellation only if the product becomes permanently unavailable due to circumstances beyond their control (e.g., regulatory action, force majeure).</li>
              <li>All cancellation requests are reviewed by the Platform. Approved cancellations will result in a full refund to the Buyer's original payment method within 5–10 business days.</li>
              <li>Disputes between Buyers and Merchants must first be submitted to the Platform for mediation before any external proceedings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Use the Platform for any unlawful purpose or in violation of applicable laws.</li>
              <li>Attempt to manipulate prices, game the price-locking system, or create fraudulent orders.</li>
              <li>Reverse engineer, scrape, or otherwise access the Platform's underlying systems without authorization.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Engage in any activity that disrupts, damages, or impairs the Platform or its servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. Intellectual Property</h2>
            <p>
              All content, trademarks, logos, and software on the Platform are the property of Citisoft
              Solution or its licensors. You are granted a limited, non-exclusive, non-transferable license
              to access and use the Platform solely for its intended purposes. No rights are granted beyond
              what is expressly stated in these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Citisoft Solution shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising out of or related
              to your use of the Platform, including but not limited to: loss of profits, loss of data,
              Merchant non-fulfillment, or price inaccuracies. Our total liability in any circumstance shall
              not exceed the total fees paid by you to the Platform in the three (3) months preceding the
              claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">12. Disclaimer of Warranties</h2>
            <p>
              The Platform is provided "as is" and "as available" without warranties of any kind, express
              or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free
              of viruses. We make no warranty regarding the accuracy of product listings provided by Merchants.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">13. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion for any
              violation of these Terms, fraudulent activity, or for any other reason with or without notice.
              Upon termination, your right to use the Platform ceases immediately. Pending orders will be
              resolved per Section 8.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">14. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify you of material changes via email
              or a prominent notice on the Platform. Continued use of the Platform after changes take effect
              constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">15. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of the Federal Republic
              of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts located
              in Nigeria.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">16. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <address className="not-italic mt-2 space-y-1">
              <p><strong>Citisoft Solution</strong></p>
              <p>Email: <a href="mailto:support@fixeddaam.com" className="text-blue-600 hover:underline">support@fixeddaam.com</a></p>
            </address>
          </section>

        </div>
      </div>
    </div>
  );
}
