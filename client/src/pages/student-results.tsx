import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Submission, Evaluation, Assignment } from "@shared/schema";

export default function StudentResults() {
  const { data: submissions = [] } = useQuery<(Submission & { evaluation?: Evaluation; assignment?: Assignment })[]>({
    queryKey: ["/api/submissions/student/all"],
  });

  const evaluatedSubmissions = submissions.filter(s => s.evaluation);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Test Results</h1>
        <p className="text-muted-foreground">View your completed test evaluations</p>
      </div>

      {evaluatedSubmissions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">No results yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete some tests to see your results here
              </p>
              <Button asChild>
                <Link href="/student/tests">Browse Tests</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {evaluatedSubmissions.map((submission) => (
            <Card key={submission.id} className="hover-elevate" data-testid={`result-${submission.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">
                      {submission.assignment?.title || "Test"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {submission.assignment?.testType}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="text-2xl font-bold" data-testid={`score-${submission.id}`}>
                      {submission.evaluation?.overallScore}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Pronunciation: </span>
                      <span className="font-medium">{submission.evaluation?.pronunciationScore}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Fluency: </span>
                      <span className="font-medium">{submission.evaluation?.fluencyScore}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Vocabulary: </span>
                      <span className="font-medium">{submission.evaluation?.vocabularyScore}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Grammar: </span>
                      <span className="font-medium">{submission.evaluation?.grammarScore}%</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/student/tests/${submission.assignmentId}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
