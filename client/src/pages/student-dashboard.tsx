import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { Mic, Trophy, BarChart3, BookOpen, Flame, Star, Zap, Award, Lock, Heart, CheckCircle } from "lucide-react";
import type { Assignment, Submission } from "@shared/schema";

interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  color: string;
}

export default function StudentDashboard() {
  const { data: assignments = [] } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments/student"],
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions/student"],
  });

  const completedCount = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  // Mock achievements data
  const achievements: AchievementBadge[] = [
    {
      id: "first-steps",
      name: "First Steps",
      description: "Completed your first test",
      icon: <CheckCircle className="h-8 w-8" />,
      earned: true,
      color: "bg-[#58cc02]"
    },
    {
      id: "7-day-streak",
      name: "7-Day Streak",
      description: "Maintained a 7-day learning streak",
      icon: <Flame className="h-8 w-8" />,
      earned: true,
      color: "bg-[#ff9600]"
    },
    {
      id: "perfect-score",
      name: "Perfect Score",
      description: "Achieved 100% on a test",
      icon: <Star className="h-8 w-8" />,
      earned: true,
      color: "bg-[#ffc800]"
    },
    {
      id: "quick-learner",
      name: "Quick Learner",
      description: "Completed 5 tests in one week",
      icon: <Zap className="h-8 w-8" />,
      earned: false,
      color: "bg-[#1cb0f6]"
    },
    {
      id: "oet-master",
      name: "OET Master",
      description: "Passed all OET sections",
      icon: <Heart className="h-8 w-8" />,
      earned: false,
      color: "bg-[#ff4b4b]"
    },
    {
      id: "top-10",
      name: "Top 10",
      description: "Reached top 10 on leaderboard",
      icon: <Trophy className="h-8 w-8" />,
      earned: false,
      color: "bg-[#ce82ff]"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Student Dashboard</h1>
        <p className="text-muted-foreground">Track your progress and take assessments</p>
      </div>

      {/* Gamification Stats Section */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2 border-[#ff9600] bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-[#ff9600]">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Day Streak</p>
                <p className="text-3xl font-bold text-[#ff9600]">7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#58cc02] bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-[#58cc02]">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total XP</p>
                <p className="text-3xl font-bold text-[#58cc02]">1250</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#1cb0f6] bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-[#1cb0f6]">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Level</p>
                <p className="text-3xl font-bold text-[#1cb0f6]">5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Weekly Goal</p>
                <Award className="h-5 w-5 text-purple-500" />
              </div>
              <Progress value={70} className="h-3" />
              <p className="text-sm font-bold text-purple-500">70% Complete</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer border-2 hover:border-[#1cb0f6] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
          <Link href="/student/tests">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Tests</CardTitle>
              <div className="p-2 rounded-full bg-blue-100">
                <Mic className="h-4 w-4 text-[#1cb0f6]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#1cb0f6]">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">Available assignments</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer border-2 hover:border-[#58cc02] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
          <Link href="/student/mock-tests">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mock Tests</CardTitle>
              <div className="p-2 rounded-full bg-green-100">
                <Trophy className="h-4 w-4 text-[#58cc02]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#58cc02]">12</div>
              <p className="text-xs text-muted-foreground">Practice tests</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer border-2 hover:border-[#ff9600] hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
          <Link href="/student/results">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Results</CardTitle>
              <div className="p-2 rounded-full bg-orange-100">
                <BarChart3 className="h-4 w-4 text-[#ff9600]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ff9600]">{completedCount}</div>
              <p className="text-xs text-muted-foreground">Completed tests</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer border-2 hover:border-purple-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-105">
          <Link href="/student/resources">
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resources</CardTitle>
              <div className="p-2 rounded-full bg-purple-100">
                <BookOpen className="h-4 w-4 text-purple-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-500">24</div>
              <p className="text-xs text-muted-foreground">Learning materials</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Achievements/Badges Section */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Award className="h-6 w-6 text-[#ffc800]" />
                Achievements
              </CardTitle>
              <CardDescription>Unlock badges as you progress in your learning journey</CardDescription>
            </div>
            <Badge className="bg-[#58cc02] hover:bg-[#58cc02] text-white text-sm">
              {achievements.filter(a => a.earned).length}/{achievements.length} Earned
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <Card
                key={achievement.id}
                className={`relative overflow-hidden transition-all duration-300 ${
                  achievement.earned
                    ? "border-2 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
                    : "border border-dashed bg-gray-50 opacity-60"
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Icon Container */}
                    <div className="relative">
                      <div
                        className={`p-4 rounded-full ${
                          achievement.earned
                            ? `${achievement.color} text-white shadow-lg`
                            : "bg-gray-300 text-gray-500"
                        } transition-all duration-300`}
                      >
                        {achievement.earned ? (
                          achievement.icon
                        ) : (
                          <Lock className="h-8 w-8" />
                        )}
                      </div>
                      {achievement.earned && (
                        <div className="absolute -top-1 -right-1 bg-[#58cc02] rounded-full p-1 border-2 border-white shadow-md">
                          <CheckCircle className="h-4 w-4 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Badge Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-bold text-base truncate ${
                          achievement.earned ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {achievement.name}
                      </h3>
                      <p
                        className={`text-sm mt-1 line-clamp-2 ${
                          achievement.earned ? "text-muted-foreground" : "text-gray-400"
                        }`}
                      >
                        {achievement.earned ? achievement.description : "Locked - Keep learning to unlock!"}
                      </p>
                      {achievement.earned && (
                        <Badge 
                          className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs"
                        >
                          +50 XP
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Shine effect for earned badges */}
                  {achievement.earned && (
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                      <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shine"></div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Available Assignments */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Available Assignments</CardTitle>
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
                  <Card 
                    key={assignment.id} 
                    className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-[#58cc02]" 
                    data-testid={`assignment-${assignment.id}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg truncate">{assignment.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {assignment.description}
                          </CardDescription>
                        </div>
                        <Badge 
                          variant={isCompleted ? "secondary" : "default"}
                          className={isCompleted ? "bg-[#58cc02] text-white hover:bg-[#58cc02]" : "bg-[#1cb0f6] hover:bg-[#1cb0f6]"}
                        >
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
                          className={!isCompleted ? "bg-[#58cc02] hover:bg-[#58cc02]/90 text-white" : ""}
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
