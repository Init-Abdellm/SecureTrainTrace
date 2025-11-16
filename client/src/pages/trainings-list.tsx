import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Calendar, Clock, Users, Trash2, Pencil } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Training, Trainee } from "@shared/schema";
import { format } from "date-fns";

export default function TrainingsList() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<Training | null>(null);

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

  const { data: trainings, isLoading } = useQuery<Training[]>({
    queryKey: ["/api/trainings"],
    enabled: isAuthenticated,
  });

  const { data: allTrainees } = useQuery<Trainee[]>({
    queryKey: ["/api/trainees"],
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/trainings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainees"] });
      toast({
        title: "Success",
        description: "Training deleted successfully",
      });
      setDeleteDialogOpen(false);
      setTrainingToDelete(null);
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
        description: "Failed to delete training",
        variant: "destructive",
      });
    },
  });

  const getTraineeStats = (trainingId: string) => {
    const trainingTrainees = allTrainees?.filter(t => t.trainingId === trainingId) || [];
    const total = trainingTrainees.length;
    const passed = trainingTrainees.filter(t => t.status === "passed").length;
    const failed = trainingTrainees.filter(t => t.status === "failed").length;
    const pending = trainingTrainees.filter(t => t.status === "pending").length;
    
    return { total, passed, failed, pending };
  };

  if (authLoading || isLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Training Programs</h1>
          <p className="text-muted-foreground mt-1">Manage your security training programs</p>
        </div>
        <Link href="/admin/trainings/new">
          <Button data-testid="button-new-training">
            <Plus className="w-4 h-4 mr-2" />
            New Training
          </Button>
        </Link>
      </div>

      {!trainings || trainings.length === 0 ? (
        <Card className="py-12">
          <CardContent className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">No trainings yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Get started by creating your first training program
            </p>
            <Link href="/admin/trainings/new">
              <Button data-testid="button-create-first-training">
                <Plus className="w-4 h-4 mr-2" />
                Create Training
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => {
            const stats = getTraineeStats(training.id);
            const passRate = stats.total > 0 
              ? Math.round((stats.passed / stats.total) * 100) 
              : 0;

            return (
              <Card key={training.id} className="flex flex-col" data-testid={`card-training-${training.id}`}>
                <CardHeader>
                  <CardTitle className="text-lg">{training.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {training.description || "No description"}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {training.date ? format(new Date(training.date), "MMM dd, yyyy") : "No date"}
                    </div>
                    {training.duration && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2" />
                        {training.duration}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="w-4 h-4 mr-2" />
                      {stats.total} trainees
                    </div>
                    
                    {stats.total > 0 && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                          <span>Pass Rate</span>
                          <span className="font-medium">{passRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-chart-2 transition-all"
                            style={{ width: `${passRate}%` }}
                          />
                        </div>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span className="text-chart-2">Passed: {stats.passed}</span>
                          <span className="text-destructive">Failed: {stats.failed}</span>
                          <span className="text-muted-foreground">Pending: {stats.pending}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Link href={`/admin/trainings/${training.id}`} className="flex-1">
                    <Button variant="default" className="w-full" data-testid={`button-view-training-${training.id}`}>
                      View Details
                    </Button>
                  </Link>
                  <Link href={`/admin/trainings/${training.id}/edit`}>
                    <Button variant="outline" size="icon" data-testid={`button-edit-training-${training.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      setTrainingToDelete(training);
                      setDeleteDialogOpen(true);
                    }}
                    data-testid={`button-delete-training-${training.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{trainingToDelete?.name}"? This will also delete all associated trainees and their certificates. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => trainingToDelete && deleteMutation.mutate(trainingToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
