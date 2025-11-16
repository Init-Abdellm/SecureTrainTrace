import { useEffect, useState, useCallback } from "react";
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
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

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
      queryClient.invalidateQueries({ queryKey: ["/api/trainings", id, "trainees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainees"] });
      
      if (data.failed === 0) {
        toast({
          title: "Success",
          description: `Successfully imported ${data.imported} trainees`,
        });
      } else {
        toast({
          title: "Partially Complete",
          description: `Imported ${data.imported} trainees, ${data.failed} failed`,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
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
          title: "Invalid File",
          description: "Please select an Excel file (.xlsx or .xls)",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

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

  const downloadTemplate = () => {
    const csvContent = "name,surname,email,phone_number,company_name,date,training_name,training_id\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trainee_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/trainings/${id}`)} 
        className="mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Training
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Upload Trainee List</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload an Excel file containing trainee information to bulk import
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Required Columns</AlertTitle>
            <AlertDescription>
              Your Excel file must contain these columns: name, surname, email, phone_number, 
              company_name (optional), date, training_name, training_id
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={downloadTemplate}
              data-testid="button-download-template"
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download Template
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
                    {uploadMutation.isPending ? "Uploading..." : "Upload File"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFile(null)}
                    disabled={uploadMutation.isPending}
                    data-testid="button-remove-file"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
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
                    Drop Excel file here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports .xlsx and .xls files
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
                      <span>Browse Files</span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>

          {uploadMutation.isPending && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Processing file...</p>
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
                  {uploadResult.failed === 0 ? "Upload Complete" : "Upload Completed with Errors"}
                </AlertTitle>
                <AlertDescription>
                  Successfully imported: {uploadResult.imported} trainees
                  {uploadResult.failed > 0 && ` • Failed: ${uploadResult.failed} trainees`}
                </AlertDescription>
              </Alert>

              {uploadResult.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Errors</CardTitle>
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
                  <Button onClick={() => navigate(`/trainings/${id}`)} data-testid="button-view-trainees">
                    View Trainees
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
