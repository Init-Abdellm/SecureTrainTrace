import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, Users, Award, TrendingUp } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Training, Trainee } from "@shared/schema";

export default function Dashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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
      return;
    }
  }, [isAuthenticated, authLoading, toast, t]);

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
      title: t("dashboard.totalTrainings"),
      value: trainings?.length || 0,
      icon: GraduationCap,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: t("dashboard.totalTrainees"),
      value: totalTrainees,
      icon: Users,
      iconBg: "bg-chart-2/10",
      iconColor: "text-chart-2",
    },
    {
      title: t("dashboard.certificatesIssued"),
      value: passedTrainees,
      icon: Award,
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3",
    },
    {
      title: t("dashboard.passRate"),
      value: `${passRate}%`,
      icon: TrendingUp,
      iconBg: "bg-chart-4/10",
      iconColor: "text-chart-4",
    },
  ];

  return (
    <div className="p-0">
      <div className="bg-white border-b border-border px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="p-6 bg-[#F3F2F2]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.title} data-testid={`stat-${stat.title.toLowerCase().replace(/ /g, '-')}`} className="border border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-normal text-muted-foreground uppercase tracking-wide mb-2">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex items-center justify-center w-10 h-10 rounded ${stat.iconBg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-border shadow-sm">
          <CardHeader className="border-b border-border px-4 py-3">
            <CardTitle className="text-base font-bold">{t("dashboard.recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              {t("dashboard.recentActivityDescription")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
