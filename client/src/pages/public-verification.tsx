import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, CheckCircle, XCircle, Search, Download, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

export default function PublicVerification() {
  const [, setLocation] = useLocation();
  const [searchId, setSearchId] = useState("");
  const [verifyId, setVerifyId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["verify", verifyId],
    queryFn: async () => {
      if (!verifyId) return null;
      const response = await fetch(`/api/verify/${verifyId}`);
      if (!response.ok) throw new Error("Verification failed");
      return response.json();
    },
    enabled: !!verifyId,
  });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setVerifyId(searchId.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">Security Training Platform</span>
          </button>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")}>
            Admin Login
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Search Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <QrCode className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Verify Certificate</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Enter a certificate ID or trainee ID to verify training completion
          </p>

          <form onSubmit={handleVerify} className="flex gap-3 max-w-xl mx-auto">
            <Input
              type="text"
              placeholder="Enter Certificate ID or Trainee ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="lg" className="gap-2">
              <Search className="w-5 h-5" />
              Verify
            </Button>
          </form>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Verifying certificate...</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && data && (
          <>
            {data.valid ? (
              <div className="space-y-6">
                {/* Success Header */}
                <div className="text-center py-8 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                  <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-green-900 dark:text-green-100 mb-2">
                    Certificate Verified
                  </h2>
                  <p className="text-green-700 dark:text-green-300">
                    This certificate is valid and authentic
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="bg-card rounded-lg border border-border p-8 shadow-lg">
                  <h3 className="text-2xl font-bold mb-6 text-center">
                    {data.trainee.name} {data.trainee.surname}
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <DetailItem label="Training" value={data.trainee.trainingName} />
                    <DetailItem
                      label="Training Date"
                      value={new Date(data.trainee.trainingDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    />
                    <DetailItem label="Email" value={data.trainee.email} />
                    <DetailItem label="Phone" value={data.trainee.phoneNumber} />
                    {data.trainee.companyName && (
                      <DetailItem label="Company" value={data.trainee.companyName} />
                    )}
                    <DetailItem label="Certificate ID" value={data.trainee.certificateId} />
                  </div>

                  {data.trainee.certificateUrl && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <a
                        href={data.trainee.certificateUrl}
                        download={`certificate-${data.trainee.certificateId}.pdf`}
                        className="w-full"
                      >
                        <Button className="w-full gap-2" size="lg">
                          <Download className="w-5 h-5" />
                          Download Certificate
                        </Button>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                <XCircle className="w-16 h-16 text-red-600 dark:text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-2">
                  Certificate Not Found
                </h2>
                <p className="text-red-700 dark:text-red-300 mb-6">
                  This certificate ID is invalid, or the certificate has not been issued yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setVerifyId(null);
                    setSearchId("");
                  }}
                >
                  Try Another ID
                </Button>
              </div>
            )}
          </>
        )}

        {/* Instructions */}
        {!verifyId && !isLoading && (
          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-semibold mb-3">How to verify:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Scan the QR code on the certificate using your phone camera</li>
              <li>• Or manually enter the Certificate ID or Trainee ID shown on the certificate</li>
              <li>• The system will instantly verify if the certificate is valid</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
}
