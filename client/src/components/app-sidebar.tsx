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
import { useAuth } from "@/lib/auth-context";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  Mic,
  Trophy,
  FolderOpen,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppSidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const teacherMenuItems = [
    { title: "Dashboard", url: "/teacher", icon: LayoutDashboard },
    { title: "Assignments", url: "/teacher/assignments", icon: FileText },
    { title: "Submissions", url: "/teacher/submissions", icon: Mic },
    { title: "Students", url: "/teacher/students", icon: Users },
    { title: "Resources", url: "/teacher/resources", icon: FolderOpen },
    { title: "Analytics", url: "/teacher/analytics", icon: BarChart3 },
  ];

  const studentMenuItems = [
    { title: "Dashboard", url: "/student", icon: LayoutDashboard },
    { title: "My Tests", url: "/student/tests", icon: Mic },
    { title: "Mock Tests", url: "/student/mock-tests", icon: Trophy },
    { title: "Results", url: "/student/results", icon: BarChart3 },
    { title: "Resources", url: "/student/resources", icon: BookOpen },
  ];

  const adminMenuItems = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Users", url: "/admin/users", icon: Users },
    { title: "Reports", url: "/admin/reports", icon: BarChart3 },
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  const menuItems =
    user?.role === "teacher"
      ? teacherMenuItems
      : user?.role === "student"
      ? studentMenuItems
      : adminMenuItems;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Mic className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">EvalAI</h2>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between gap-2 rounded-md border p-3">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.fullName ? getInitials(user.fullName) : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={logout}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
