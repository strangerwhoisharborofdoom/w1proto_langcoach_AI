import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AudioRecorder } from "@/components/audio-recorder";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Mic,
  CheckCircle,
  TrendingUp,
  Sparkles,
  MessageSquare,
  BookOpen,
  Zap,
  Award,
  BarChart3,
} from "lucide-react";

interface EvaluationResult {
  overallScore: number;
  pronunciationScore: number;
  fluencyScore: number;
  vocabularyScore: number;
  grammarScore: number;
  feedback: {
    pronunciation: string;
    fluency: string;
    vocabulary: string;
    grammar: string;
    strengths: string[];
    improvements: string[];
  };
  transcription: string;
}

export default function StudentVoicePractice() {
  const { toast } = useToast();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [testType, setTestType] = useState<string>("OET");

  const evaluateMutation = useMutation({
    mutationFn: async (data: { audio: Blob; testType: string }) => {
      const formData = new FormData();
      formData.append("audio", data.audio, "recording.webm");
      formData.append("testType", data.testType);

      const response = await fetch("/api/evaluate-speech", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to evaluate speech");
      }

      return response.json();
    },
    onSuccess: (data) => {
      setEvaluation(data);
      toast({
        title: "Evaluation Complete!",
        description: `Overall score: ${data.overallScore}/100`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Evaluation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRecordingComplete = (blob: Blob) => {
    setAudioBlob(blob);
    setEvaluation(null);
  };

  const handleEvaluate = () => {
    if (audioBlob) {
      evaluateMutation.mutate({ audio: audioBlob, testType });
    }
  };

  const handleNewRecording = () => {
    setAudioBlob(null);
    setEvaluation(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#58cc02]";
    if (score >= 60) return "text-[#ffc800]";
    return "text-[#ff4b4b]";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  const scoreCategories = evaluation
    ? [
        { name: "Pronunciation", score: evaluation.pronunciationScore, icon: <Mic className="h-4 w-4" /> },
        { name: "Fluency", score: evaluation.fluencyScore, icon: <MessageSquare className="h-4 w-4" /> },
        { name: "Vocabulary", score: evaluation.vocabularyScore, icon: <BookOpen className="h-4 w-4" /> },
        { name: "Grammar", score: evaluation.grammarScore, icon: <Zap className="h-4 w-4" /> },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">
          Voice Practice
        </h1>
        <p className="text-muted-foreground">Practice your speaking skills with AI-powered feedback</p>
      </div>

      {/* Test Type Selector */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Select Test Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["OET", "IELTS", "Business English"].map((type) => (
              <Button
                key={type}
                variant={testType === type ? "default" : "outline"}
                onClick={() => setTestType(type)}
                className={testType === type ? "bg-[#58cc02] hover:bg-[#58cc02]/90" : ""}
                data-testid={`button-test-type-${type.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {testType === type && <CheckCircle className="h-4 w-4 mr-2" />}
                {type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recording Instructions */}
      <Card className="border-2 border-[#1cb0f6] bg-gradient-to-br from-blue-50 to-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-[#1cb0f6] text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">Recording Instructions</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Speak clearly and naturally</li>
                <li>• Aim for 30-60 seconds of speaking</li>
                <li>• Describe a topic or answer a practice question</li>
                <li>• Our AI will evaluate your pronunciation, fluency, vocabulary, and grammar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Recorder */}
      <AudioRecorder onRecordingComplete={handleRecordingComplete} maxDuration={120} />

      {/* Submit Button */}
      {audioBlob && !evaluation && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleEvaluate}
            disabled={evaluateMutation.isPending}
            className="bg-[#58cc02] hover:bg-[#58cc02]/90 text-white"
            data-testid="button-evaluate"
          >
            {evaluateMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Evaluating...
              </>
            ) : (
              <>
                <Award className="h-5 w-5 mr-2" />
                Get AI Feedback
              </>
            )}
          </Button>
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card className="border-2 border-[#58cc02] shadow-xl">
            <CardHeader className="text-center pb-3">
              <CardTitle className="text-2xl">Overall Performance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative" data-testid="score-overall">
                <div className="flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-green-50 to-white border-8 border-[#58cc02]">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(evaluation.overallScore)}`} data-testid="text-overall-score">
                      {evaluation.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">/ 100</div>
                  </div>
                </div>
              </div>
              <Badge className="bg-[#58cc02] hover:bg-[#58cc02] text-white text-lg px-4 py-2" data-testid="badge-score-label">
                {getScoreLabel(evaluation.overallScore)}
              </Badge>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#1cb0f6]" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {scoreCategories.map((category) => (
                  <div key={category.name} className="space-y-2" data-testid={`score-${category.name.toLowerCase()}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-[#1cb0f6]/10 text-[#1cb0f6]">
                          {category.icon}
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className={`text-2xl font-bold ${getScoreColor(category.score)}`} data-testid={`text-score-${category.name.toLowerCase()}`}>
                        {category.score}
                      </span>
                    </div>
                    <Progress value={category.score} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transcription */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                Your Speech (Transcription)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-md bg-muted/50" data-testid="transcription-text">
                <p className="text-sm leading-relaxed">{evaluation.transcription}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#58cc02]" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {evaluation.feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-[#58cc02] flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#ffc800]" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {evaluation.feedback.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-5 w-5 rounded-full bg-[#ffc800]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-[#ffc800]" />
                      </div>
                      <span className="text-sm">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Specific Feedback */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Pronunciation Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{evaluation.feedback.pronunciation}</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Fluency Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{evaluation.feedback.fluency}</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Vocabulary Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{evaluation.feedback.vocabulary}</p>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Grammar Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{evaluation.feedback.grammar}</p>
              </CardContent>
            </Card>
          </div>

          {/* New Recording Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={handleNewRecording}
              data-testid="button-new-recording"
            >
              <Mic className="h-5 w-5 mr-2" />
              Record Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
