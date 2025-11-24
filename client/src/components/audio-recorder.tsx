import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Square, Play, Pause, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  maxDuration?: number;
}

export function AudioRecorder({ onRecordingComplete, maxDuration = 300 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Setup audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev + 1 >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      visualize();
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const visualize = () => {
    if (!analyserRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    if (!canvasCtx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      analyserRef.current!.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = "hsl(var(--card))";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "hsl(var(--primary))";
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setDuration(0);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioURL]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Waveform visualization */}
        <div className="relative">
          <canvas
            ref={canvasRef}
            width="600"
            height="100"
            className="w-full h-24 rounded-md bg-card"
          />
          {!isRecording && !audioURL && (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              Ready to record
            </div>
          )}
        </div>

        {/* Recording controls */}
        <div className="flex flex-col items-center gap-4">
          {!audioURL ? (
            <>
              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={cn(
                  "h-20 w-20 rounded-full",
                  isRecording && "animate-pulse"
                )}
                onClick={isRecording ? stopRecording : startRecording}
                data-testid={isRecording ? "button-stop-recording" : "button-start-recording"}
              >
                {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </Button>
              {isRecording && (
                <div className="text-center">
                  <p className="text-2xl font-mono font-semibold" data-testid="text-recording-time">
                    {formatTime(recordingTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Max: {formatTime(maxDuration)}
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                onLoadedMetadata={(e) => setDuration(Math.floor(e.currentTarget.duration))}
              />
              <div className="flex gap-2">
                <Button
                  size="lg"
                  variant="default"
                  className="h-16 w-16 rounded-full"
                  onClick={togglePlayback}
                  data-testid="button-play-recording"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 w-16 rounded-full"
                  onClick={deleteRecording}
                  data-testid="button-delete-recording"
                >
                  <Trash2 className="h-6 w-6" />
                </Button>
              </div>
              <div className="text-center">
                <p className="text-lg font-mono font-semibold" data-testid="text-recording-duration">
                  Duration: {formatTime(duration)}
                </p>
                <p className="text-sm text-muted-foreground">Recording ready for submission</p>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
