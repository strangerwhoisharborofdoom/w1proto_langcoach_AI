import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Clock, FileText } from "lucide-react";
import type { Assignment, Submission } from "@shared/schema";

export default function StudentTests() {
  const { data: assignments = [], isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments/student"],
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions/student"],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">My Tests</h1>
        <p className="text-muted-foreground">Browse and complete your assigned tests</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading tests...</div>
      ) : assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tests available</h3>
              <p className="text-muted-foreground">
                Your teacher hasn't assigned any tests yet.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {assignments.map((assignment) => {
            const submission = submissions.find((s) => s.assignmentId === assignment.id);
            const isCompleted = !!submission;

            return (
              <Card key={assignment.id} className="hover-elevate" data-testid={`test-card-${assignment.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="truncate">{assignment.title}</CardTitle>
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
                  <div className="space-y-3">
                    {assignment.instructions && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {assignment.instructions}
                      </p>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      {assignment.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <Button
                        asChild
                        variant={isCompleted ? "outline" : "default"}
                        data-testid={`button-start-${assignment.id}`}
                      >
                        <Link href={`/student/tests/${assignment.id}`}>
                          {isCompleted ? "View Results" : "Start Test"}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
