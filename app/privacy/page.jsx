import LegalPageLayout from "../../src/components/LegalPageLayout";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for The Plateful — what data we collect and how we use it.",
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p><em>Last updated: May 2026</em></p>

      <h3>Data We Collect</h3>
      <p>
        The Plateful does <strong>not</strong> directly collect, store, or retain any personal data.
        There are no user accounts, no sign-ups, and no login required. However, third-party
        services used by the app (such as Google AdSense) may collect data as described below.
      </p>

      <h3>Data Stored on Your Device</h3>
      <p>
        All recipe searches, ingredient lists, and meal plans exist only in your browser&apos;s
        memory during your session. When you close or refresh the page, this data is gone. Nothing
        is saved to your device&apos;s local storage or sent to our servers for storage.
      </p>

      <h3>Data Sent to Third Parties</h3>
      <p>Your search queries and ingredient inputs are sent to the following services to generate results:</p>
      <ul>
        <li>
          <strong>Cerebras AI</strong> — Your recipe queries are sent to the Cerebras API to
          generate AI-powered recipe suggestions, nutrition estimates, and meal plans. Cerebras
          processes your request and returns a response. We do not send any identifying
          information — only the text of your query.
        </li>
        <li>
          <strong>TheMealDB</strong> — Your search terms are sent to TheMealDB&apos;s public API
          to find matching real-world recipes. This is a free, open recipe database. No personal
          data is included in these requests.
        </li>
        <li>
          <strong>Google Fonts</strong> — The app loads typefaces (Playfair Display and DM Sans)
          from Google Fonts. Google may log standard request data (IP address, browser info) as
          described in their privacy policy.
        </li>
        <li>
          <strong>Google AdSense</strong> — The app displays ads served by Google AdSense. Google
          may use cookies and web beacons to serve ads based on your browsing activity. Google&apos;s
          advertising cookies enable it and its partners to serve ads based on your visit to this
          site and/or other sites on the Internet. You can opt out of personalized advertising by
          visiting{" "}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}>Google Ads Settings</a>.
          For more information, see{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}>Google&apos;s Privacy Policy</a>.
        </li>
      </ul>

      <h3>Cookies</h3>
      <p>
        The Plateful itself does not set any cookies. However, Google AdSense and Google Fonts
        may set cookies on your device to serve and measure advertisements and load fonts.
        These are third-party cookies governed by Google&apos;s privacy policies. You can manage
        or disable cookies through your browser settings.
      </p>

      <h3>Rate Limiting</h3>
      <p>
        To prevent abuse, we temporarily track IP addresses in server memory for rate limiting
        purposes (max 10 requests per minute). This data is not logged, stored, or shared, and
        is automatically discarded when the server instance resets.
      </p>

      <h3>Children&apos;s Privacy</h3>
      <p>
        The Plateful is not directed at children under 13. We do not knowingly collect any
        information from children.
      </p>

      <h3>Changes to This Policy</h3>
      <p>
        We may update this policy from time to time. Changes will be reflected on this page
        with an updated revision date.
      </p>
    </LegalPageLayout>
  );
}
