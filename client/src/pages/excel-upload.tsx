import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface UploadResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

export default function ExcelUpload() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: t("common.unauthorized"),
        description: t("login.loggedOut"),
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast, t]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("training_id", id!);

      const response = await fetch("/api/trainees/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("401: Unauthorized");
        }
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data: UploadResult) => {
      setUploadResult(data);
      // Invalidate all trainee-related queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/trainees"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/trainings"],
        exact: false
      });
      // Also refetch the specific training's trainees
      queryClient.refetchQueries({
        queryKey: ["/api/trainings", id, "trainees"]
      });

      if (data.imported > 0) {
        if (data.failed === 0) {
          toast({
            title: t("excelUpload.successTitle"),
            description: t("excelUpload.successDescription", { count: data.imported }),
          });
        } else {
          toast({
            title: t("excelUpload.partiallyCompleteTitle"),
            description: t("excelUpload.partiallyCompleteDescription", { count: data.imported, failed: data.failed }),
            variant: "destructive",
          });
        }
        // Redirect to training detail page after successful upload (even if partial)
        setTimeout(() => {
          navigate(`/admin/trainings/${id}`);
        }, 1500);
      } else {
        toast({
          title: t("excelUpload.uploadFailed"),
          description: t("excelUpload.noTraineesImported", { count: data.failed }),
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t("common.unauthorized"),
          description: t("login.loggedOut"),
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t("excelUpload.errorTitle"),
        description: error.message || t("excelUpload.errorDescription"),
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        toast({
          title: t("excelUpload.invalidFile"),
          description: t("excelUpload.invalidFileDescription"),
          variant: "destructive",
        });
      }
    }
  }, [toast, t]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setUploadResult(null);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const downloadTemplate = async () => {
    // Create a proper Excel file with XLSX library
    const XLSX = await import('xlsx');

    // Create sample data with proper headers
    const data = [
      { name: 'John', surname: 'Doe', email: 'john@example.com', phone_number: '1234567890', company_name: 'Acme Corp' },
      { name: 'Jane', surname: 'Smith', email: 'jane@example.com', phone_number: '0987654321', company_name: 'Tech Inc' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trainees');

    // Generate Excel file
    XLSX.writeFile(workbook, 'trainee_template.xlsx');
  };

  return (
    <div className="p-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/admin/trainings/${id}`)}
        className="mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {t("excelUpload.backToTraining")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t("excelUpload.title")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("excelUpload.subtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("excelUpload.requiredColumns")}</AlertTitle>
            <AlertDescription>
              {t("excelUpload.requiredColumnsDescription")}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              data-testid="button-download-template"
            >
              <FileSpreadsheet className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("excelUpload.downloadTemplate")}
            </Button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging ? "border-primary bg-primary/5" : "border-border"}
              ${selectedFile ? "bg-muted/50" : ""}
            `}
            data-testid="dropzone"
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    data-testid="button-upload"
                  >
                    {uploadMutation.isPending ? t("excelUpload.uploading") : t("excelUpload.upload")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploadMutation.isPending}
                    data-testid="button-remove-file"
                  >
                    <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t("excelUpload.remove")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {t("excelUpload.dropFile")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("excelUpload.supportsFiles")}
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-input"
                    data-testid="input-file"
                  />
                  <label htmlFor="file-input">
                    <Button variant="outline" asChild>
                      <span>{t("excelUpload.browseFiles")}</span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>

          {uploadMutation.isPending && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("excelUpload.processing")}</p>
              <Progress value={50} className="w-full" />
            </div>
          )}

          {uploadResult && (
            <div className="space-y-4">
              <Alert variant={uploadResult.failed === 0 ? "default" : "destructive"}>
                {uploadResult.failed === 0 ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {uploadResult.failed === 0 ? t("excelUpload.uploadComplete") : t("excelUpload.uploadCompletedWithErrors")}
                </AlertTitle>
                <AlertDescription>
                  {t("excelUpload.successfullyImported", { count: uploadResult.imported })}
                  {uploadResult.failed > 0 && ` • ${t("excelUpload.failedCount", { count: uploadResult.failed })}`}
                </AlertDescription>
              </Alert>

              {uploadResult.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t("excelUpload.errors")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {uploadResult.errors.map((error, index) => (
                        <div
                          key={index}
                          className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
                        >
                          {error}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {uploadResult.imported > 0 && (
                <div className="flex justify-end">
                  <Button onClick={() => navigate(`/admin/trainings/${id}`)} data-testid="button-view-trainees">
                    {t("excelUpload.viewTrainees")}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
