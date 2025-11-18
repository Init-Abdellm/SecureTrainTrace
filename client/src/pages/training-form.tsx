import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import { insertTrainingSchema, type InsertTraining, type Training } from "@shared/schema";

// Extended form schema with separate duration fields
const trainingFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  durationValue: z.string().optional(),
  durationUnit: z.enum(["hour", "day", "month"]).optional(),
}).refine((data) => {
  // If one duration field is filled, both should be filled
  if (data.durationValue && !data.durationUnit) return false;
  if (data.durationUnit && !data.durationValue) return false;
  return true;
}, {
  message: "Both duration value and unit are required",
  path: ["durationValue"],
});

type TrainingFormData = z.infer<typeof trainingFormSchema>;

// Helper function to parse duration string (e.g., "4 hours" -> { value: "4", unit: "hour" })
function parseDuration(duration: string | null | undefined): { value: string; unit: "hour" | "day" | "month" } | null {
  if (!duration) return null;
  
  const lowerDuration = duration.toLowerCase().trim();
  
  // Try to match patterns like "4 hours", "2 jours", "1 mois", etc.
  const hourPatterns = [/hours?/, /heures?/, /ساعات?/];
  const dayPatterns = [/days?/, /jours?/, /أيام?/];
  const monthPatterns = [/months?/, /mois/, /أشهر?/];
  
  const match = lowerDuration.match(/^(\d+)\s*(.+)$/);
  if (!match) return null;
  
  const value = match[1];
  const unitText = match[2];
  
  if (hourPatterns.some(pattern => pattern.test(unitText))) {
    return { value, unit: "hour" as const };
  }
  if (dayPatterns.some(pattern => pattern.test(unitText))) {
    return { value, unit: "day" as const };
  }
  if (monthPatterns.some(pattern => pattern.test(unitText))) {
    return { value, unit: "month" as const };
  }
  
  return null;
}

// Helper function to format duration for display/storage
function formatDuration(value: string, unit: "hour" | "day" | "month", t: (key: string) => string): string {
  if (!value || !unit) return "";
  const unitMap = {
    hour: t("trainingForm.durationUnit.hour"),
    day: t("trainingForm.durationUnit.day"),
    month: t("trainingForm.durationUnit.month"),
  };
  return `${value} ${unitMap[unit]}`;
}

export default function TrainingForm() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const isEditing = !!id;

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

  const { data: training, isLoading: trainingLoading } = useQuery<Training>({
    queryKey: ["/api/trainings", id],
    enabled: isAuthenticated && isEditing,
  });

  const form = useForm<TrainingFormData>({
    resolver: zodResolver(trainingFormSchema),
    defaultValues: {
      name: "",
      description: undefined,
      date: "",
      durationValue: undefined,
      durationUnit: undefined,
    },
  });

  useEffect(() => {
    if (training) {
      const parsedDuration = parseDuration(training.duration);
      form.reset({
        name: training.name,
        description: training.description || undefined,
        date: training.date,
        durationValue: parsedDuration?.value || undefined,
        durationUnit: parsedDuration?.unit || undefined,
      });
    }
  }, [training, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertTraining) => {
      await apiRequest("POST", "/api/trainings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      toast({
        title: t("common.success"),
        description: t("trainingForm.createSuccess"),
      });
      navigate("/admin/trainings");
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
        title: t("common.error"),
        description: t("trainingForm.createError"),
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertTraining) => {
      await apiRequest("PATCH", `/api/trainings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trainings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trainings", id] });
      toast({
        title: t("common.success"),
        description: t("trainingForm.updateSuccess"),
      });
      navigate(`/admin/trainings/${id}`);
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
        title: t("common.error"),
        description: t("trainingForm.updateError"),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TrainingFormData) => {
    // Combine duration value and unit into a single string
    const duration = data.durationValue && data.durationUnit
      ? formatDuration(data.durationValue, data.durationUnit, t)
      : undefined;

    const submitData: InsertTraining = {
      name: data.name,
      description: data.description,
      date: data.date,
      duration,
    };

    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (authLoading || (isEditing && trainingLoading)) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(isEditing ? `/admin/trainings/${id}` : "/admin/trainings")} 
        className="mb-4"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("common.back")}
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? t("trainingForm.editTitle") : t("trainingForm.createTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("trainingForm.trainingName")}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={t("trainingForm.trainingNamePlaceholder")} 
                        {...field} 
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("common.description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("trainingForm.descriptionPlaceholder")}
                        className="resize-none"
                        rows={4}
                        {...field}
                        value={field.value || ""}
                        data-testid="input-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("trainingForm.trainingDate")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        data-testid="input-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>{t("common.duration")}</FormLabel>
                <div className={`flex gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <FormField
                    control={form.control}
                    name="durationValue"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            placeholder="0"
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              // Only allow positive integers
                              if (value === "" || /^\d+$/.test(value)) {
                                field.onChange(value);
                              }
                            }}
                            data-testid="input-duration-value"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="durationUnit"
                    render={({ field }) => (
                      <FormItem className="w-[140px]">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-duration-unit">
                              <SelectValue placeholder={t("trainingForm.durationUnit.placeholder")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hour">{t("trainingForm.durationUnit.hour")}</SelectItem>
                            <SelectItem value="day">{t("trainingForm.durationUnit.day")}</SelectItem>
                            <SelectItem value="month">{t("trainingForm.durationUnit.month")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(isEditing ? `/admin/trainings/${id}` : "/admin/trainings")}
                  data-testid="button-cancel"
                >
                  {t("common.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? t("common.saving")
                    : isEditing
                    ? t("trainingForm.updateTraining")
                    : t("trainingForm.createTraining")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
