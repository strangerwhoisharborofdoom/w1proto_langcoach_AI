import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import type { Submission, Evaluation, Assignment, User } from "@shared/schema";

export default function TeacherSubmissions() {
  const { toast } = useToast();
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const { data: submissions = [], isLoading } = useQuery<
    (Submission & { evaluation?: Evaluation; assignment?: Assignment; student?: User })[]
  >({
    queryKey: ["/api/teacher/submissions/all"],
  });

  const feedbackMutation = useMutation({
    mutationFn: async ({ submissionId, feedback }: { submissionId: string; feedback: string }) => {
      return await apiRequest("POST", "/api/teacher/feedback", { submissionId, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/submissions/all"] });
      toast({
        title: "Feedback submitted",
        description: "Your feedback has been saved.",
      });
      setSelectedSubmission(null);
      setFeedback("");
    },
  });

  const handleSubmitFeedback = (submissionId: string) => {
    if (!feedback.trim()) {
      toast({
        title: "Empty feedback",
        description: "Please write some feedback before submitting",
        variant: "destructive",
      });
      return;
    }

    feedbackMutation.mutate({ submissionId, feedback });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Student Submissions</h1>
        <p className="text-muted-foreground">Review and provide feedback on student work</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
              <p className="text-muted-foreground">
                Submissions will appear here once students complete tests.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} data-testid={`submission-card-${submission.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">
                      {submission.assignment?.title || "Unknown Assignment"}
                    </CardTitle>
                    <CardDescription>
                      By {submission.student?.fullName || "Unknown Student"} •{" "}
                      {new Date(submission.submittedAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      submission.status === "feedback_provided"
                        ? "default"
                        : submission.status === "evaluated"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {submission.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submission.evaluation && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      <div className="text-center p-2 rounded-md bg-muted">
                        <div className="text-2xl font-bold">{submission.evaluation.overallScore}%</div>
                        <div className="text-xs text-muted-foreground">Overall</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-muted">
                        <div className="text-lg font-semibold">
                          {submission.evaluation.pronunciationScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Pronunciation</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-muted">
                        <div className="text-lg font-semibold">
                          {submission.evaluation.fluencyScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Fluency</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-muted">
                        <div className="text-lg font-semibold">
                          {submission.evaluation.vocabularyScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Vocabulary</div>
                      </div>
                      <div className="text-center p-2 rounded-md bg-muted">
                        <div className="text-lg font-semibold">
                          {submission.evaluation.grammarScore}%
                        </div>
                        <div className="text-xs text-muted-foreground">Grammar</div>
                      </div>
                    </div>
                  )}

                  {submission.transcription && (
                    <div className="p-3 rounded-md bg-muted">
                      <p className="text-sm font-medium mb-1">Transcription:</p>
                      <p className="text-sm">{submission.transcription}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Dialog
                      open={selectedSubmission === submission.id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setSelectedSubmission(null);
                          setFeedback("");
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant={submission.status === "feedback_provided" ? "outline" : "default"}
                          onClick={() => setSelectedSubmission(submission.id)}
                          data-testid={`button-feedback-${submission.id}`}
                        >
                          {submission.status === "feedback_provided" ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              View Feedback
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Provide Feedback
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Teacher Feedback</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Write your feedback for the student..."
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={6}
                            data-testid="input-feedback"
                          />
                          <Button
                            onClick={() => handleSubmitFeedback(submission.id)}
                            disabled={feedbackMutation.isPending}
                            className="w-full"
                            data-testid="button-submit-feedback"
                          >
                            {feedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
