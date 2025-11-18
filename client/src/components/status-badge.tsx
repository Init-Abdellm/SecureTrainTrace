import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface StatusBadgeProps {
  status: "pending" | "passed" | "failed";
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const { t } = useTranslation();
  
  const config = {
    pending: {
      label: t("status.pending"),
      className: "bg-muted text-muted-foreground border-muted-border",
      icon: Clock,
    },
    passed: {
      label: t("status.passed"),
      className: "bg-chart-2/10 text-chart-2 border-chart-2/20",
      icon: CheckCircle2,
    },
    failed: {
      label: t("status.failed"),
      className: "bg-destructive/10 text-destructive border-destructive/20",
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <Badge 
      variant="outline" 
      className={`${className} font-medium`}
      data-testid={`badge-status-${status}`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  );
}
