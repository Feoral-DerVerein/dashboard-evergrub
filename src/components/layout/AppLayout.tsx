import { useEffect } from "react";
import { NavLink, Outlet, useLocation, Link } from "react-router-dom";
import { BarChart3, LogOut, Package, Truck, Plug, FileText, Settings, CreditCard, User, MessageSquare, Brain, Bot, Scale, Heart, Globe, Check, Network } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { NegentropyFloatingWidget } from "@/components/ai/NegentropyFloatingWidget";
import { useAuth } from "@/context/AuthContext";
import { KitDigitalFooter } from "@/components/layout/KitDigitalFooter";


function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { signOut } = useAuth();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'ca', name: 'Català' },
    { code: 'de', name: 'Deutsch' },
  ];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const menuItems = [
    { title: t("sidebar.performance"), url: "/kpi", icon: BarChart3 },
    { title: t("sidebar.predictive_analytics"), url: "/predictive-analytics", icon: Brain },
    { title: t("sidebar.inventory_products"), url: "/inventory-products", icon: Package },
    { title: t("sidebar.impact_compliance"), url: "/legal", icon: Scale },
  ];

  const handleLogout = async () => {
    await signOut();
    toast.success(t("common.logout") + " successfully"); // Small adjustment for now, can be fully translated later
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-100 bg-white">
      <SidebarHeader className="border-b border-gray-100 p-4 bg-white">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/lovable-uploads/negentropy-icon-blue-sparkles.png"
            alt="Negentropy AI"
            className={isCollapsed ? "h-8 w-8 object-contain" : "h-8 w-8 object-contain"}
          />
          {!isCollapsed && <span className="font-bold text-xl tracking-tight">Negentropy AI</span>}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.url}
                    tooltip={item.title}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-2 bg-white">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full" tooltip={t("sidebar.account")}>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/lovable-uploads/81d95ee7-5dc6-4639-b0da-bb02c332b8ea.png" />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span>{t("sidebar.account")}</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50">
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 w-full cursor-pointer">
                    <User className="h-4 w-4" />
                    {t("common.profile")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/integrations" className="flex items-center gap-2 w-full cursor-pointer">
                    <Plug className="h-4 w-4" />
                    {t("sidebar.integrations")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/docs" className="flex items-center gap-2 w-full cursor-pointer">
                    <FileText className="h-4 w-4" />
                    Documentation
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/pricing" className="flex items-center gap-2 w-full cursor-pointer">
                    <CreditCard className="h-4 w-4" />
                    {t("sidebar.pricing")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/test-data" className="flex items-center gap-2 w-full cursor-pointer text-blue-600 font-medium bg-blue-50/50">
                    <Network className="h-4 w-4" />
                    Developer Tools
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Globe className="mr-2 h-4 w-4" />
                    <span>{t("common.language")}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {languages.map((lang) => (
                      <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${i18n.language === lang.code ? "opacity-100" : "opacity-0"
                            }`}
                        />
                        {lang.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("common.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (user?.uid) {
      // Trigger background sync for all active integrations
      import("@/services/syncManager").then(({ syncManager }) => {
        syncManager.performAutoSync(user.uid);
      });
    }
  }, [user?.uid]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col glass-card min-h-screen">
          <div className="h-14 border-b border-gray-100 flex items-center px-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10 justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
          </div>
          <div className="flex-1 p-4">
            <Outlet />
          </div>
          <KitDigitalFooter />
        </main>
      </div>
      <NegentropyFloatingWidget />
      <OfflineIndicator />
    </SidebarProvider>
  );
};

export default AppLayout;