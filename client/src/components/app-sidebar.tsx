import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useTranslation } from "react-i18next";
import { Home, GraduationCap, BarChart3, Settings, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const menuItems = [
    {
      title: t("sidebar.dashboard"),
      url: "/admin",
      icon: Home,
    },
    {
      title: t("sidebar.trainings"),
      url: "/admin/trainings",
      icon: GraduationCap,
    },
    {
      title: t("sidebar.analytics"),
      url: "/admin/analytics",
      icon: BarChart3,
    },
  ];

  const getInitials = () => {
    return "AD";
  };

  return (
    <Sidebar side={isRTL ? "right" : "left"} className={`${isRTL ? 'border-l' : 'border-r'} border-border bg-white`}>
      <SidebarHeader className="px-4 py-3 border-b border-border">
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded bg-primary">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">{t("sidebar.trainingPlatform")}</h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-0 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url ||
                  (item.url !== "/admin" && location.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      data-active={isActive}
                      className={`px-4 py-2 mx-2 rounded hover:bg-[#F3F2F2] data-[active=true]:bg-[#E8F4FB] data-[active=true]:text-[#0176D3] data-[active=true]:font-bold data-[active=true]:${isRTL ? 'border-r-4' : 'border-l-4'} data-[active=true]:border-[#0176D3] data-[active=true]:rounded-none data-[active=true]:${isRTL ? 'pr-[12px]' : 'pl-[12px]'}`}
                      data-testid={`sidebar-${item.title.toLowerCase()}`}
                    >
                      <Link href={item.url}>
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm">{item.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <div className={`flex items-center gap-2 px-2 py-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-xs font-bold bg-[#0176D3] text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-sidebar-foreground truncate">
              {t("sidebar.administrator")}
            </p>
            <p className="text-xs text-muted-foreground truncate">{t("sidebar.systemAdmin")}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              await fetch("/api/logout", { method: "POST" });
              window.location.href = "/";
            }}
            className="flex-shrink-0 h-8 w-8"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
