import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import type { User, Submission, Evaluation } from "@shared/schema";

export default function TeacherStudents() {
  const { data: students = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/teacher/students"],
  });

  const { data: submissions = [] } = useQuery<(Submission & { evaluation?: Evaluation })[]>({
    queryKey: ["/api/teacher/student-progress"],
  });

  const getStudentStats = (studentId: string) => {
    const studentSubmissions = submissions.filter((s) => s.studentId === studentId);
    const completed = studentSubmissions.filter((s) => s.evaluation).length;
    const avgScore =
      completed > 0
        ? Math.round(
            studentSubmissions
              .filter((s) => s.evaluation)
              .reduce((sum, s) => sum + (s.evaluation?.overallScore || 0), 0) / completed
          )
        : 0;

    return { total: studentSubmissions.length, completed, avgScore };
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Students</h1>
        <p className="text-muted-foreground">View student progress and performance</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading students...</div>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No students yet</h3>
              <p className="text-muted-foreground">
                Students will appear here once they register and complete assignments.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => {
            const stats = getStudentStats(student.id);

            return (
              <Card key={student.id} data-testid={`student-card-${student.id}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{getInitials(student.fullName)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{student.fullName}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tests Taken</span>
                      <Badge variant="secondary">{stats.total}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Completed</span>
                      <Badge variant="secondary">{stats.completed}</Badge>
                    </div>
                    {stats.completed > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avg Score</span>
                        <span className="font-semibold">{stats.avgScore}%</span>
                      </div>
                    )}
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
