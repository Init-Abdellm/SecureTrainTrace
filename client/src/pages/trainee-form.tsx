import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertTraineeSchema, type InsertTrainee, type Trainee } from "@shared/schema";
import { z } from "zod";

const traineeFormSchema = insertTraineeSchema.pick({
  name: true,
  surname: true,
  email: true,
  phoneNumber: true,
  companyName: true,
});

type TraineeFormData = z.infer<typeof traineeFormSchema>;

export default function TraineeForm() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const { data: trainee, isLoading: traineeLoading } = useQuery<Trainee>({
    queryKey: ["/api/trainees", id],
    enabled: isAuthenticated && !!id,
  });

  const form = useForm<TraineeFormData>({
    resolver: zodResolver(traineeFormSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      phoneNumber: "",
      companyName: undefined,
    },
  });

  useEffect(() => {
    if (trainee) {
      form.reset({
        name: trainee.name,
        surname: trainee.surname,
        email: trainee.email,
        phoneNumber: trainee.phoneNumber,
        companyName: trainee.companyName || undefined,
      });
    }
  }, [trainee, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: TraineeFormData) => {
      await apiRequest("PATCH", `/api/trainees/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({
        title: "Success",
        description: "Trainee updated successfully",
      });
      if (trainee?.trainingId) {
        navigate(`/admin/trainings/${trainee.trainingId}`);
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
        description: "Failed to update trainee",
        variant: "destructive",
      });
    },
  });

  if (authLoading || traineeLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!trainee) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Trainee not found</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(`/admin/trainings/${trainee.trainingId}`)} 
        className="mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Training
      </Button>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Trainee</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update trainee information
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-surname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-company" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-save"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/admin/trainings/${trainee.trainingId}`)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
