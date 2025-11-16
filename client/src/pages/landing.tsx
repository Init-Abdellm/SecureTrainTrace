import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Shield, Award, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-16 pt-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary">
              <GraduationCap className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Security Training Traceability Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Professional platform for managing offline security training programs, tracking trainee progress, 
            and issuing verifiable digital certificates with QR code verification.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = "/api/login"}
            className="px-8 py-6 text-lg"
            data-testid="button-login"
          >
            Sign In to Continue
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Comprehensive Management</h3>
              <p className="text-sm text-muted-foreground">
                Upload trainee lists via Excel, manage training programs, and track progress with ease.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10 mb-4">
                <Award className="w-6 h-6 text-chart-2" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Digital Certificates</h3>
              <p className="text-sm text-muted-foreground">
                Automatically generate professional PDF certificates with embedded QR codes for verification.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-3/10 mb-4">
                <CheckCircle className="w-6 h-6 text-chart-3" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Public Verification</h3>
              <p className="text-sm text-muted-foreground">
                Allow anyone to verify certificate authenticity by scanning QR codes or entering trainee IDs.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Administrator access only. Please sign in to continue.</p>
        </div>
      </div>
    </div>
  );
}
