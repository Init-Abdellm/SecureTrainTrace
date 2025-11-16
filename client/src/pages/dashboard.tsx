import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Users, Award, TrendingUp } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Training, Trainee } from "@shared/schema";

export default function Dashboard() {
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
      return;
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalTrainees = trainees?.length || 0;
  const passedTrainees = trainees?.filter(t => t.status === "passed").length || 0;
  const passRate = totalTrainees > 0 ? Math.round((passedTrainees / totalTrainees) * 100) : 0;

  const stats = [
    {
      title: "Total Trainings",
      value: trainings?.length || 0,
      icon: GraduationCap,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Total Trainees",
      value: totalTrainees,
      icon: Users,
      iconBg: "bg-chart-2/10",
      iconColor: "text-chart-2",
    },
    {
      title: "Certificates Issued",
      value: passedTrainees,
      icon: Award,
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3",
    },
    {
      title: "Pass Rate",
      value: `${passRate}%`,
      icon: TrendingUp,
      iconBg: "bg-chart-4/10",
      iconColor: "text-chart-4",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your training programs and trainee performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={`stat-${stat.title.toLowerCase().replace(/ /g, '-')}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`flex items-center justify-center w-12 h-12 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            View detailed training information and manage trainees from the Trainings page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
