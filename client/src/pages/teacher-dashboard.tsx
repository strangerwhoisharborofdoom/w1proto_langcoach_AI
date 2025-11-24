import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, CheckCircle2, Clock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import type { Assignment, Submission } from "@shared/schema";

export default function TeacherDashboard() {
  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions/teacher"],
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const evaluatedCount = submissions.filter((s) => s.status === "evaluated").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Teacher Dashboard</h1>
        <p className="text-muted-foreground">Manage assignments and student evaluations</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-assignments">{assignments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-pending">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Evaluated</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-evaluated">{evaluatedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-submissions">{submissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Recent Assignments</CardTitle>
            <Button asChild data-testid="button-create-assignment">
              <Link href="/teacher/assignments">Create New</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignments yet. Create your first assignment to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.slice(0, 5).map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-md border"
                  data-testid={`assignment-${assignment.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {assignment.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                        {assignment.testType}
                      </span>
                      {assignment.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/teacher/assignments/${assignment.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
