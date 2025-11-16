import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Training, Trainee } from "@shared/schema";
import { BarChart3, TrendingUp, Users, Award } from "lucide-react";

export default function Analytics() {
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

  const { data: trainings, isLoading: trainingsLoading } = useQuery<Training[]>({
    queryKey: ["/api/trainings"],
    enabled: isAuthenticated,
  });

  const { data: trainees, isLoading: traineesLoading } = useQuery<Trainee[]>({
    queryKey: ["/api/trainees"],
    enabled: isAuthenticated,
  });

  if (authLoading || trainingsLoading || traineesLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  const totalTrainees = trainees?.length || 0;
  const passedTrainees = trainees?.filter(t => t.status === "passed").length || 0;
  const failedTrainees = trainees?.filter(t => t.status === "failed").length || 0;
  const pendingTrainees = trainees?.filter(t => t.status === "pending").length || 0;
  const passRate = totalTrainees > 0 ? Math.round((passedTrainees / totalTrainees) * 100) : 0;

  const companies = new Set(trainees?.map(t => t.companyName).filter(Boolean));
  const companiesCount = companies.size;

  const trainingStats = trainings?.map(training => {
    const trainingTrainees = trainees?.filter(t => t.trainingId === training.id) || [];
    const passed = trainingTrainees.filter(t => t.status === "passed").length;
    const total = trainingTrainees.length;
    const rate = total > 0 ? Math.round((passed / total) * 100) : 0;

    return {
      name: training.name,
      total,
      passed,
      failed: trainingTrainees.filter(t => t.status === "failed").length,
      pending: trainingTrainees.filter(t => t.status === "pending").length,
      passRate: rate,
    };
  }) || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Insights and statistics about your training programs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Total Trainees
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {totalTrainees}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Overall Pass Rate
                </p>
                <p className="text-2xl font-bold text-chart-2">
                  {passRate}%
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-2/10">
                <TrendingUp className="w-6 h-6 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Certificates Issued
                </p>
                <p className="text-2xl font-bold text-chart-3">
                  {passedTrainees}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-3/10">
                <Award className="w-6 h-6 text-chart-3" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Companies
                </p>
                <p className="text-2xl font-bold text-chart-4">
                  {companiesCount}
                </p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-chart-4/10">
                <BarChart3 className="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Passed</span>
                  <span className="font-medium text-chart-2">{passedTrainees} ({totalTrainees > 0 ? Math.round((passedTrainees / totalTrainees) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-chart-2"
                    style={{ width: `${totalTrainees > 0 ? (passedTrainees / totalTrainees) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Failed</span>
                  <span className="font-medium text-destructive">{failedTrainees} ({totalTrainees > 0 ? Math.round((failedTrainees / totalTrainees) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-destructive"
                    style={{ width: `${totalTrainees > 0 ? (failedTrainees / totalTrainees) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium">{pendingTrainees} ({totalTrainees > 0 ? Math.round((pendingTrainees / totalTrainees) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-muted-foreground"
                    style={{ width: `${totalTrainees > 0 ? (pendingTrainees / totalTrainees) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Programs Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {trainingStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No training data available
              </p>
            ) : (
              <div className="space-y-4">
                {trainingStats.slice(0, 5).map((stat, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground truncate max-w-[200px]">
                        {stat.name}
                      </span>
                      <span className="font-medium">
                        {stat.passRate}% ({stat.passed}/{stat.total})
                      </span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary"
                        style={{ width: `${stat.passRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
