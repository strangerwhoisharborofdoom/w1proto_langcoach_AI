import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AudioRecorder } from "@/components/audio-recorder";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import type { Assignment, Submission, Evaluation } from "@shared/schema";

export default function StudentTest() {
  const [, params] = useRoute("/student/tests/:id");
  const { toast } = useToast();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: assignment, isLoading: assignmentLoading } = useQuery<Assignment>({
    queryKey: ["/api/assignments", params?.id],
    enabled: !!params?.id,
  });

  const { data: submission } = useQuery<Submission & { evaluation?: Evaluation }>({
    queryKey: ["/api/submissions/assignment", params?.id],
    enabled: !!params?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("assignmentId", params!.id);

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to submit recording");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions/assignment", params?.id] });
      toast({
        title: "Test submitted!",
        description: "Your recording is being evaluated by AI. This may take a moment.",
      });
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Submission failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast({
        title: "No recording",
        description: "Please record your response before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    submitMutation.mutate(audioBlob);
  };

  if (assignmentLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading assignment...</div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Assignment not found</h2>
          <Button asChild>
            <Link href="/student">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (submission?.evaluation) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild data-testid="button-back">
            <Link href="/student">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{assignment.title}</h1>
            <p className="text-muted-foreground">Test Results</p>
          </div>
        </div>

        {/* Overall Score */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-5xl font-bold" data-testid="text-overall-score">
              {submission.evaluation.overallScore}%
            </CardTitle>
            <CardDescription>Overall Score</CardDescription>
          </CardHeader>
        </Card>

        {/* Category Scores */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pronunciation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" data-testid="text-pronunciation-score">
                    {submission.evaluation.pronunciationScore}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {submission.evaluation.aiFeedback.pronunciation}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fluency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" data-testid="text-fluency-score">
                    {submission.evaluation.fluencyScore}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {submission.evaluation.aiFeedback.fluency}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vocabulary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" data-testid="text-vocabulary-score">
                    {submission.evaluation.vocabularyScore}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {submission.evaluation.aiFeedback.vocabulary}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grammar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold" data-testid="text-grammar-score">
                    {submission.evaluation.grammarScore}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {submission.evaluation.aiFeedback.grammar}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strengths and Improvements */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {submission.evaluation.aiFeedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500">✓</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Areas for Improvement</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {submission.evaluation.aiFeedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-500">!</span>
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Transcription */}
        {submission.transcription && (
          <Card>
            <CardHeader>
              <CardTitle>Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{submission.transcription}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild data-testid="button-back">
          <Link href="/student">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-assignment-title">{assignment.title}</h1>
          <p className="text-muted-foreground">{assignment.testType}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">{assignment.description}</p>
          {assignment.instructions && (
            <div className="p-4 rounded-md bg-muted">
              <p className="text-sm">{assignment.instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Your Response</CardTitle>
          <CardDescription>
            Click the microphone to start recording. Speak clearly and naturally.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AudioRecorder onRecordingComplete={setAudioBlob} maxDuration={180} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!audioBlob || isSubmitting}
          data-testid="button-submit-test"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "Submitting..." : "Submit Test"}
        </Button>
      </div>
    </div>
  );
}
