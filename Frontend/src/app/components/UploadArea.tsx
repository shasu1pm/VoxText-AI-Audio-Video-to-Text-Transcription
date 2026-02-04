import { useRef } from "react";
import { Upload, Music, Video, FileAudio } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadArea({ onFileSelect, disabled = false }: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={cn(
        "relative border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 p-12 transition-all cursor-pointer",
        "hover:border-blue-300 hover:bg-blue-50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.flac,.mp4,.ts"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      <div className="flex flex-col items-center text-center space-y-4">
        {/* Icons */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Music className="w-6 h-6 text-blue-600" />
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <FileAudio className="w-6 h-6 text-blue-600" />
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <Video className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* Primary Text */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Upload your audio/video ≤ 200 MB
          </h3>
          <p className="text-sm text-muted-foreground">
            Try Free — No credit card required
          </p>
        </div>

        {/* CTA Button */}
        <Button
          type="button"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Drag and drop / Upload a file
        </Button>

        {/* Supported Formats */}
        <p className="text-xs text-muted-foreground">
          Supports MP3, WAV, M4A, AAC, FLAC, MP4, TS
        </p>
      </div>
    </div>
  );
}
