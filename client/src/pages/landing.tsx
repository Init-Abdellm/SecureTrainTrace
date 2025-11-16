import { Link } from "wouter";
import { Shield, CheckCircle, QrCode, FileSpreadsheet, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Security Training Platform</span>
          </div>
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Professional Security Training
            <br />
            <span className="text-primary">Certificate Management</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive platform for managing offline security training traceability. 
            Track trainees, issue digital certificates, and enable instant verification.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/verify">
              <Button size="lg" className="gap-2">
                <QrCode className="w-5 h-5" />
                Verify Certificate
              </Button>
            </Link>
            <Link href="/admin">
              <Button size="lg" variant="outline" className="gap-2">
                Admin Access
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Streamlined Training Management
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileSpreadsheet className="w-10 h-10 text-primary" />}
              title="Bulk Import"
              description="Upload trainee lists via Excel with automatic validation and profile creation."
            />
            <FeatureCard
              icon={<CheckCircle className="w-10 h-10 text-primary" />}
              title="Status Tracking"
              description="Track trainee progress with pending, passed, and failed status management."
            />
            <FeatureCard
              icon={<Award className="w-10 h-10 text-primary" />}
              title="Digital Certificates"
              description="Automatically generate professional PDF certificates for successful trainees."
            />
            <FeatureCard
              icon={<QrCode className="w-10 h-10 text-primary" />}
              title="QR Verification"
              description="Each certificate includes a QR code for instant public verification."
            />
            <FeatureCard
              icon={<Shield className="w-10 h-10 text-primary" />}
              title="Secure & Compliant"
              description="Built with security best practices and compliance standards in mind."
            />
            <FeatureCard
              icon={<ArrowRight className="w-10 h-10 text-primary" />}
              title="Easy Access"
              description="Public verification requires no login. Admin tools are securely protected."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            <Step
              number="1"
              title="Upload Trainee Data"
              description="Administrators upload Excel files with trainee information for each training session."
            />
            <Step
              number="2"
              title="Track Progress"
              description="Update trainee status as they complete training and assessments."
            />
            <Step
              number="3"
              title="Issue Certificates"
              description="Certificates are automatically generated when trainees pass, complete with unique IDs and QR codes."
            />
            <Step
              number="4"
              title="Verify Anytime"
              description="Anyone can scan the QR code or enter a certificate ID to verify authenticity instantly."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Verify a Certificate?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Enter a certificate ID or scan a QR code to verify training completion.
          </p>
          <Link href="/verify">
            <Button size="lg" variant="secondary" className="gap-2">
              <QrCode className="w-5 h-5" />
              Verify Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Security Training Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border border-border bg-background">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div className="flex-1 pt-2">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
