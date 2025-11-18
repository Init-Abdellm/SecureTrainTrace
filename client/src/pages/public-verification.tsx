import { useState } from "react";
import { useLocation } from "wouter";
import { HardHat, CheckCircle, XCircle, Search, Download, QrCode, Shield } from "lucide-react";
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
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 px-6 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setLocation("/")}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center">
                <HardHat className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-base font-bold text-gray-900">Construction Site Safety</span>
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/admin")}
              className="border-gray-300 h-9"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Login
            </Button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {/* Search Section */}
          {!verifyId && (
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 rounded-2xl">
                    <QrCode className="w-8 h-8 text-orange-500" />
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white leading-[1.1] tracking-tight">
                    Verify Certificate
                  </h1>
                  <p className="text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Enter a certificate ID or trainee ID to instantly verify training completion and authenticity.
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter Certificate ID or Trainee ID"
                      value={searchId}
                      onChange={(e) => setSearchId(e.target.value)}
                      className="h-14 text-base px-6 border-2 border-zinc-200 dark:border-zinc-800 focus:border-orange-500 dark:focus:border-orange-500 rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base font-medium bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Verify Certificate
                  </Button>
                </form>

                <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-semibold text-zinc-900 dark:text-white mb-3">How to verify:</h3>
                  <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Scan the QR code on the certificate using your phone camera</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>Or manually enter the Certificate ID or Trainee ID shown on the certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      <span>The system will instantly verify if the certificate is valid</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 via-transparent to-yellow-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 rounded-3xl p-8 shadow-2xl">
                  <img
                    src="/Certificate.gif"
                    alt="Certificate Verification"
                    className="w-full h-auto rounded-2xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-xl text-zinc-600 dark:text-zinc-400">Verifying certificate...</p>
            </div>
          )}

          {/* Results */}
          {!isLoading && data && (
            <div className="max-w-4xl mx-auto">
              {data.valid ? (
                <div className="space-y-8">
                  {/* Success Header */}
                  <div className="text-center py-12 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-3xl border-2 border-green-200 dark:border-green-900">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-2xl mb-6">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold text-green-900 dark:text-green-100 mb-3">
                      Certificate Verified
                    </h2>
                    <p className="text-lg text-green-700 dark:text-green-300">
                      This certificate is valid and authentic
                    </p>
                  </div>

                  {/* Certificate Details */}
                  <div className="bg-white dark:bg-zinc-900 rounded-3xl border-2 border-zinc-200 dark:border-zinc-800 p-8 lg:p-12 shadow-xl">
                    <h3 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
                      {data.trainee.name} {data.trainee.surname}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
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
                      <a
                        href={data.trainee.certificateUrl}
                        download={`certificate-${data.trainee.certificateId}.pdf`}
                        className="block"
                      >
                        <Button className="w-full h-14 text-base font-medium bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
                          <Download className="w-5 h-5 mr-2" />
                          Download Certificate
                        </Button>
                      </a>
                    )}
                  </div>

                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setVerifyId(null);
                        setSearchId("");
                      }}
                      className="border-2 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      Verify Another Certificate
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-3xl border-2 border-red-200 dark:border-red-900">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-2xl mb-6">
                    <XCircle className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-red-900 dark:text-red-100 mb-3">
                    Certificate Not Found
                  </h2>
                  <p className="text-lg text-red-700 dark:text-red-300 mb-8">
                    This certificate ID is invalid, or the certificate has not been issued yet.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setVerifyId(null);
                      setSearchId("");
                    }}
                    className="border-2 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Try Another ID
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        {label}
      </div>
      <div className="text-lg font-semibold text-zinc-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}
