import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Download, Pencil, Trash2, Search, FileDown } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { StatusBadge } from "@/components/status-badge";
import type { Training, Trainee } from "@shared/schema";
import { format } from "date-fns";

export default function TrainingDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [traineeToDelete, setTraineeToDelete] = useState<Trainee | null>(null);
  const [statusUpdateDialogOpen, setStatusUpdateDialogOpen] = useState(false);
  const [traineeToUpdate, setTraineeToUpdate] = useState<Trainee | null>(null);
  const [newStatus, setNewStatus] = useState<"pending" | "passed" | "failed">("pending");

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

  const { data: training, isLoading: trainingLoading } = useQuery<Training>({
    queryKey: ["/api/trainings", id],
    enabled: isAuthenticated && !!id,
  });

  const { data: trainees, isLoading: traineesLoading } = useQuery<Trainee[]>({
    queryKey: ["/api/trainings", id, "trainees"],
    enabled: isAuthenticated && !!id,
  });

  const deleteTraineeMutation = useMutation({
    mutationFn: async (traineeId: string) => {
      await apiRequest("DELETE", `/api/trainees/${traineeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings", id, "trainees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainees"] });
      toast({
        title: "Success",
        description: "Trainee deleted successfully",
      });
      setDeleteDialogOpen(false);
      setTraineeToDelete(null);
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
        description: "Failed to delete trainee",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ traineeId, status }: { traineeId: string; status: string }) => {
      await apiRequest("PATCH", `/api/trainees/${traineeId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings", id, "trainees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainees"] });
      toast({
        title: "Success",
        description: "Trainee status updated successfully",
      });
      setStatusUpdateDialogOpen(false);
      setTraineeToUpdate(null);
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
        description: "Failed to update trainee status",
        variant: "destructive",
      });
    },
  });

  const exportToCSV = () => {
    if (!trainees || !training) return;

    const headers = ["Name", "Surname", "Email", "Phone", "Company", "Status", "Certificate ID"];
    const rows = filteredTrainees.map(t => [
      t.name,
      t.surname,
      t.email,
      t.phoneNumber,
      t.companyName || "",
      t.status,
      t.certificateId || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${training.name.replace(/[^a-z0-9]/gi, "_")}_trainees.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || trainingLoading || traineesLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Training not found</h3>
            <Button onClick={() => navigate("/trainings")}>Back to Trainings</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredTrainees = (trainees || []).filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.companyName && t.companyName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: trainees?.length || 0,
    passed: trainees?.filter(t => t.status === "passed").length || 0,
    failed: trainees?.filter(t => t.status === "failed").length || 0,
    pending: trainees?.filter(t => t.status === "pending").length || 0,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/trainings">
          <Button variant="ghost" className="mb-4" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trainings
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{training.name}</h1>
            <p className="text-muted-foreground mt-1">{training.description || "No description"}</p>
            <div className="flex gap-6 mt-4 text-sm text-muted-foreground">
              {training.date && (
                <span>Date: {format(new Date(training.date), "MMM dd, yyyy")}</span>
              )}
              {training.duration && <span>Duration: {training.duration}</span>}
            </div>
          </div>
          <Link href={`/admin/trainings/${id}/upload`}>
            <Button data-testid="button-upload-excel">
              <Upload className="w-4 h-4 mr-2" />
              Upload Excel
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Total Trainees</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Passed</p>
            <p className="text-2xl font-bold text-chart-2">{stats.passed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Failed</p>
            <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-muted-foreground">{stats.pending}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Trainees</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search trainees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-trainees"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40" data-testid="select-status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="passed">Passed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportToCSV} data-testid="button-export-csv">
                <FileDown className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTrainees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {trainees && trainees.length > 0
                  ? "No trainees match your search"
                  : "No trainees yet"}
              </p>
              {!trainees || trainees.length === 0 ? (
                <Link href={`/admin/trainings/${id}/upload`}>
                  <Button data-testid="button-upload-first">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Trainees
                  </Button>
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainees.map((trainee) => (
                    <TableRow key={trainee.id} data-testid={`row-trainee-${trainee.id}`}>
                      <TableCell className="font-medium">
                        {trainee.name} {trainee.surname}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{trainee.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {trainee.companyName || "—"}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => {
                            setTraineeToUpdate(trainee);
                            setNewStatus(trainee.status as "pending" | "passed" | "failed");
                            setStatusUpdateDialogOpen(true);
                          }}
                          data-testid={`button-status-${trainee.id}`}
                        >
                          <StatusBadge status={trainee.status as "pending" | "passed" | "failed"} />
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {trainee.status === "passed" && trainee.certificateUrl && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = trainee.certificateUrl!;
                                link.download = `certificate-${trainee.name}-${trainee.surname}.pdf`;
                                link.click();
                              }}
                              data-testid={`button-download-cert-${trainee.id}`}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          <Link href={`/admin/trainees/${trainee.id}/edit`}>
                            <Button variant="outline" size="icon" data-testid={`button-edit-trainee-${trainee.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setTraineeToDelete(trainee);
                              setDeleteDialogOpen(true);
                            }}
                            data-testid={`button-delete-trainee-${trainee.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trainee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {traineeToDelete?.name} {traineeToDelete?.surname}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => traineeToDelete && deleteTraineeMutation.mutate(traineeToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={statusUpdateDialogOpen} onOpenChange={setStatusUpdateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Status</AlertDialogTitle>
            <AlertDialogDescription>
              Update the status for {traineeToUpdate?.name} {traineeToUpdate?.surname}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as "pending" | "passed" | "failed")}>
              <SelectTrigger data-testid="select-new-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="passed">Passed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-status">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => traineeToUpdate && updateStatusMutation.mutate({
                traineeId: traineeToUpdate.id,
                status: newStatus
              })}
              data-testid="button-confirm-status"
            >
              Update Status
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
