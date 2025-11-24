import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import TeacherDashboard from "@/pages/teacher-dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import TeacherAssignments from "@/pages/teacher-assignments";
import TeacherStudents from "@/pages/teacher-students";
import TeacherSubmissions from "@/pages/teacher-submissions";
import StudentTest from "@/pages/student-test";
import StudentTests from "@/pages/student-tests";
import StudentResults from "@/pages/student-results";
import PlaceholderPage from "@/pages/placeholder-page";

function ProtectedRoute({
  component: Component,
  allowedRoles,
}: {
  component: React.ComponentType;
  allowedRoles: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Redirect to={`/${user.role}`} />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route>
          <Redirect to="/auth" />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/auth">
        <Redirect to={`/${user.role}`} />
      </Route>

      {/* Teacher Routes */}
      <Route path="/teacher">
        <ProtectedRoute component={TeacherDashboard} allowedRoles={["teacher"]} />
      </Route>
      <Route path="/teacher/assignments">
        <ProtectedRoute component={TeacherAssignments} allowedRoles={["teacher"]} />
      </Route>
      <Route path="/teacher/students">
        <ProtectedRoute component={TeacherStudents} allowedRoles={["teacher"]} />
      </Route>
      <Route path="/teacher/submissions">
        <ProtectedRoute component={TeacherSubmissions} allowedRoles={["teacher"]} />
      </Route>
      <Route path="/teacher/resources">
        <ProtectedRoute
          component={() => <PlaceholderPage title="Resources" description="Manage learning materials" />}
          allowedRoles={["teacher"]}
        />
      </Route>
      <Route path="/teacher/analytics">
        <ProtectedRoute
          component={() => <PlaceholderPage title="Analytics" description="View detailed analytics" />}
          allowedRoles={["teacher"]}
        />
      </Route>

      {/* Student Routes */}
      <Route path="/student">
        <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />
      </Route>
      <Route path="/student/tests">
        <ProtectedRoute component={StudentTests} allowedRoles={["student"]} />
      </Route>
      <Route path="/student/tests/:id">
        <ProtectedRoute component={StudentTest} allowedRoles={["student"]} />
      </Route>
      <Route path="/student/mock-tests">
        <ProtectedRoute
          component={() => <PlaceholderPage title="Mock Tests" description="Practice with mock tests" />}
          allowedRoles={["student"]}
        />
      </Route>
      <Route path="/student/results">
        <ProtectedRoute component={StudentResults} allowedRoles={["student"]} />
      </Route>
      <Route path="/student/resources">
        <ProtectedRoute
          component={() => <PlaceholderPage title="Resources" description="Access learning materials" />}
          allowedRoles={["student"]}
        />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute
          component={() => <PlaceholderPage title="User Management" description="Manage users and permissions" />}
          allowedRoles={["admin"]}
        />
      </Route>
      <Route path="/admin/reports">
        <ProtectedRoute
          component={() => <PlaceholderPage title="Reports" description="Generate and view reports" />}
          allowedRoles={["admin"]}
        />
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute
          component={() => <PlaceholderPage title="Settings" description="Configure system settings" />}
          allowedRoles={["admin"]}
        />
      </Route>

      {/* Default redirect */}
      <Route path="/">
        <Redirect to={`/${user.role}`} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user } = useAuth();
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (!user) {
    return <Router />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-2 p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
