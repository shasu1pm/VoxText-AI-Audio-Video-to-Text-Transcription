import { FileAudio, Video, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/app/components/ui/progress";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

interface FileLoaderCardProps {
  file: File;
  progress: number;
  status: "uploading" | "processing" | "completed" | "error";
  onRemove: () => void;
  errorMessage?: string;
}

export function FileLoaderCard({
  file,
  progress,
  status,
  onRemove,
  errorMessage,
}: FileLoaderCardProps) {
  const isAudio = file.type.startsWith("audio/");
  const fileSize = (file.size / (1024 * 1024)).toFixed(2);

  const getStatusText = () => {
    switch (status) {
      case "uploading":
        return `Uploading ${progress}%`;
      case "processing":
        return "Processing transcript... This may take a few moments.";
      case "completed":
        return "✓ Transcript is ready";
      case "error":
        return errorMessage || "Upload failed. Please try again.";
      default:
        return "";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "error":
        return "text-destructive";
      default:
        return "text-blue-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* File Info Card */}
      <div
        className={cn(
          "flex items-center gap-4 p-4 rounded-xl border bg-card",
          status === "error" && "border-destructive/50"
        )}
      >
        {/* File Icon */}
        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
          {isAudio ? (
            <FileAudio className="w-6 h-6 text-blue-600" />
          ) : (
            <Video className="w-6 h-6 text-blue-600" />
          )}
        </div>

        {/* File Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{file.name}</h4>
          <p className="text-sm text-muted-foreground">
            {isAudio ? "Audio" : "Video"} • {fileSize} MB
          </p>
        </div>

        {/* Status Icon / Delete Button */}
        <div className="flex-shrink-0">
          {status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : status === "error" ? (
            <AlertCircle className="w-5 h-5 text-destructive" />
          ) : status === "processing" ? (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {status !== "error" && (
        <div className="space-y-2">
          <Progress
            value={progress}
            className={cn(
              "h-2",
              status === "completed" && "bg-green-100"
            )}
            indicatorClassName={status === "completed" ? "bg-green-600" : "bg-blue-600"}
          />
          <p className={cn("text-sm font-medium", getStatusColor())}>
            {getStatusText()}
          </p>
        </div>
      )}

      {/* Error Message */}
      {status === "error" && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-destructive font-medium">
              {getStatusText()}
            </p>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onRemove}
                className="h-7 text-xs"
              >
                Remove
              </Button>
              <Button
                size="sm"
                onClick={onRemove}
                className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}