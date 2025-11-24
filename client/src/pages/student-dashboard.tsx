import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Mic, Trophy, BarChart3, BookOpen } from "lucide-react";
import type { Assignment, Submission } from "@shared/schema";

export default function StudentDashboard() {
  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments/student"],
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions/student"],
  });

  const completedCount = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Student Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and take assessments</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate cursor-pointer">
          <Link href="/student/tests">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tests</CardTitle>
              <Mic className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">Available assignments</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <Link href="/student/mock-tests">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mock Tests</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Practice tests</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <Link href="/student/results">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Results</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedCount}</div>
              <p className="text-xs text-muted-foreground">Completed tests</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover-elevate cursor-pointer">
          <Link href="/student/resources">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Learning materials</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Available Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Available Assignments</CardTitle>
          <CardDescription>Start a new test or continue where you left off</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No assignments available at the moment.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignments.map((assignment) => {
                const submission = submissions.find((s) => s.assignmentId === assignment.id);
                const isCompleted = !!submission;

                return (
                  <Card key={assignment.id} className="hover-elevate" data-testid={`assignment-${assignment.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{assignment.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {assignment.description}
                          </CardDescription>
                        </div>
                        <Badge variant={isCompleted ? "secondary" : "default"}>
                          {assignment.testType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-2">
                        {assignment.dueDate && (
                          <p className="text-sm text-muted-foreground">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                        )}
                        <Button
                          asChild
                          variant={isCompleted ? "outline" : "default"}
                          data-testid={`button-start-test-${assignment.id}`}
                        >
                          <Link href={`/student/tests/${assignment.id}`}>
                            {isCompleted ? "View Results" : "Start Test"}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
