import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Download, Calendar, Building, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

interface VerificationData {
  valid: boolean;
  trainee?: {
    name: string;
    surname: string;
    email: string;
    phoneNumber: string;
    companyName?: string;
    trainingName: string;
    trainingDate: string;
    certificateId: string;
    certificateUrl?: string;
  };
}

export default function Verification() {
  const { id } = useParams();

  const { data, isLoading } = useQuery<VerificationData>({
    queryKey: ["/api/verify", id],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-3xl">
          <CardContent className="p-12">
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || !data.valid || !data.trainee) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-3xl">
          <CardContent className="py-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10">
                <XCircle className="w-12 h-12 text-destructive" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Certificate Not Issued or Invalid
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              This certificate could not be verified. Possible reasons:
            </p>
            <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-2 mb-8">
              <li>• The trainee has not completed the training yet</li>
              <li>• The trainee did not pass the training</li>
              <li>• The certificate ID is incorrect</li>
              <li>• The certificate has been revoked</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { trainee } = data;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-chart-2/10">
              <CheckCircle2 className="w-12 h-12 text-chart-2" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-verified">
            Certificate Verified
          </h1>
          <p className="text-2xl text-muted-foreground">
            {trainee.name} {trainee.surname}
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Trainee Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium" data-testid="text-email">{trainee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{trainee.phoneNumber}</p>
                      </div>
                    </div>
                    {trainee.companyName && (
                      <div className="flex items-start gap-3">
                        <Building className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Company</p>
                          <p className="font-medium">{trainee.companyName}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Training Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Training Program</p>
                      <p className="font-medium" data-testid="text-training-name">{trainee.trainingName}</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Completion Date</p>
                        <p className="font-medium">
                          {format(new Date(trainee.trainingDate), "MMMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-l pl-8">
                <div className="text-center space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Certificate ID
                    </p>
                    <p className="font-mono text-sm bg-muted px-4 py-2 rounded-md" data-testid="text-certificate-id">
                      {trainee.certificateId}
                    </p>
                  </div>

                  {trainee.certificateUrl && (
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = trainee.certificateUrl!;
                        link.download = `certificate-${trainee.name}-${trainee.surname}.pdf`;
                        link.click();
                      }}
                      className="w-full"
                      data-testid="button-download-certificate"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>This certificate has been verified and is authentic.</p>
          <p className="mt-1">Issued by Security Training Traceability Platform</p>
        </div>
      </div>
    </div>
  );
}
