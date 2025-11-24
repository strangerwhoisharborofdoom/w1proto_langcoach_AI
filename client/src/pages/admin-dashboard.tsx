import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileText, BarChart3, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import type { User, Assignment, Submission, Evaluation } from "@shared/schema";

export default function AdminDashboard() {
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/admin/assignments"],
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/admin/submissions"],
  });

  const { data: evaluations = [] } = useQuery<Evaluation[]>({
    queryKey: ["/api/admin/evaluations"],
  });

  const studentCount = users.filter((u) => u.role === "student").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;
  const avgScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length)
    : 0;

  // Test completion data
  const testTypeData = [
    {
      name: "OET",
      completed: submissions.filter((s) => 
        assignments.find((a) => a.id === s.assignmentId && a.testType === "OET")
      ).length,
    },
    {
      name: "IELTS",
      completed: submissions.filter((s) =>
        assignments.find((a) => a.id === s.assignmentId && a.testType === "IELTS")
      ).length,
    },
    {
      name: "Business English",
      completed: submissions.filter((s) =>
        assignments.find((a) => a.id === s.assignmentId && a.testType === "Business English")
      ).length,
    },
  ];

  // Performance trend (mock data - in real app would be historical)
  const performanceTrend = [
    { month: "Jan", score: 65 },
    { month: "Feb", score: 68 },
    { month: "Mar", score: 72 },
    { month: "Apr", score: 75 },
    { month: "May", score: avgScore || 78 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-students">{studentCount}</div>
            <p className="text-xs text-muted-foreground">Active learners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-teachers">{teacherCount}</div>
            <p className="text-xs text-muted-foreground">Educators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-tests">{assignments.length}</div>
            <p className="text-xs text-muted-foreground">Total assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-stat-avg-score">{avgScore}%</div>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Completion by Type</CardTitle>
            <CardDescription>Number of completed tests per category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Average scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Latest test submissions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions yet
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.slice(0, 5).map((submission) => {
                const assignment = assignments.find((a) => a.id === submission.assignmentId);
                const evaluation = evaluations.find((e) => e.submissionId === submission.id);

                return (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-md border"
                    data-testid={`submission-${submission.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {assignment?.title || "Unknown Assignment"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {evaluation && (
                        <span className="text-sm font-mono font-semibold">
                          {evaluation.overallScore}%
                        </span>
                      )}
                      <span className={`text-xs px-2 py-1 rounded-md ${
                        submission.status === "evaluated"
                          ? "bg-green-500/10 text-green-500"
                          : submission.status === "feedback_provided"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
