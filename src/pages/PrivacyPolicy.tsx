import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24 md:py-28 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: October 23, 2025</p>
        
        <Card className="p-8 glass-card border-border/50 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to AI Image Studio ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered image generation service.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">Information We Collect</h2>
            <div className="space-y-3 text-muted-foreground">
              <p><strong>Account Information:</strong> When you create an account, we collect your email address and authentication credentials.</p>
              <p><strong>Generated Content:</strong> We store the prompts you enter and the images you generate to provide you with a history of your creations.</p>
              <p><strong>Usage Data:</strong> We collect information about how you interact with our service, including pages visited and features used.</p>
              <p><strong>Technical Data:</strong> We automatically collect information such as IP address, browser type, device information, and operating system.</p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide and maintain our AI image generation service</li>
              <li>To create and manage your account</li>
              <li>To store your generation history for easy access</li>
              <li>To improve our service and develop new features</li>
              <li>To communicate with you about service updates or issues</li>
              <li>To ensure the security and integrity of our platform</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Storage and Security</h2>
            <p className="text-muted-foreground mb-3">
              Your data is stored securely using industry-standard encryption and security measures. We implement appropriate technical and organizational safeguards to protect your personal information from unauthorized access, disclosure, alteration, or destruction.
            </p>
            <p className="text-muted-foreground">
              Generated images and prompts are stored in our secure database and are only accessible to you through your authenticated account.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">Third-Party Services</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We use the following third-party services:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>AI Service Providers:</strong> To generate images based on your prompts</li>
                <li><strong>Authentication Services:</strong> To securely manage user accounts</li>
                <li><strong>Advertising Services:</strong> To display relevant advertisements (Google AdSense)</li>
                <li><strong>Analytics:</strong> To understand how users interact with our service</li>
              </ul>
              <p className="mt-3">
                These third parties have their own privacy policies and we encourage you to review them.
              </p>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience, maintain your session, and analyze site usage. You can control cookie settings through your browser, but disabling cookies may affect the functionality of our service.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">Your Rights</h2>
            <p className="text-muted-foreground mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Object to processing of your personal information</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-semibold mb-3">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact us through your account settings or by reaching out to our support team.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
