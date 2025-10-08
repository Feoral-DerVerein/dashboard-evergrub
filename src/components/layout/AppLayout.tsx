import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BarChart3, Settings, Store, ShoppingCart, LogOut } from "lucide-react";
import { useNotificationsAndOrders } from "@/hooks/useNotificationsAndOrders";
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
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
const menuItems = [
  { title: "Performance", url: "/kpi", icon: BarChart3 },
  { title: "Market B2C", url: "/products", icon: ShoppingCart },
  { title: "Market B2B", url: "/market", icon: Store },
  { title: "Settings", url: "/configuration", icon: Settings },
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-100 bg-white">
      <SidebarHeader className="border-b border-gray-100 p-4 bg-white">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/57a9a6e0-d484-424e-b78c-34034334c2f7.png" 
            alt="Main Logo" 
            className={isCollapsed ? "h-8 w-8 object-contain" : "h-10 w-auto"}
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
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
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

const AppLayout = () => {
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  if (isDashboard) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full glass-card min-h-screen">
          <Outlet />
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 glass-card">
          <div className="h-12 border-b border-gray-100 flex items-center px-4">
            <SidebarTrigger />
          </div>
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;