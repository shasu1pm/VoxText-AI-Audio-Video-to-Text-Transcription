import { useEffect, useState } from "react";
import { ChevronDown, Download, File } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { cn } from "@/app/components/ui/utils";
import { toast } from "sonner";

type FileFormat = "docx" | "txt" | "srt";

interface DownloadDropdownProps {
  disabled?: boolean;
  onDownload: (format: FileFormat) => Promise<boolean | void> | boolean | void;
}

const FORMATS: { value: FileFormat; label: string; description: string }[] = [
  { value: "docx", label: "Word Document", description: "DOCX" },
  { value: "txt", label: "Plain Text", description: "TXT" },
  { value: "srt", label: "Subtitle File", description: "SRT" },
];

export function DownloadDropdown({ disabled, onDownload }: DownloadDropdownProps) {
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FileFormat | null>(null);

  useEffect(() => {
    if (disabled) {
      setOpen(false);
      setSelectedFormat(null);
    }
  }, [disabled]);

  const handleDownload = async () => {
    if (!selectedFormat) return;
    try {
      const result = await onDownload(selectedFormat);
      if (result === false) {
        throw new Error("Download failed");
      }
      setOpen(false);
    } catch (error) {
      toast.error("Download failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full md:w-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            className={cn(
              "w-full md:w-[260px] justify-between rounded-xl h-11 px-4 border text-sm font-medium bg-white text-[#111827]",
              "border-[#ef4444] hover:bg-white hover:text-[#111827]",
              "focus-visible:border-[#ef4444] focus-visible:ring-2 focus-visible:ring-[#ef4444] focus-visible:ring-offset-0",
              "disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] disabled:border-[#e5e7eb] disabled:cursor-not-allowed disabled:opacity-100"
            )}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-current" />
              <span className="truncate">Download Your Transcript</span>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-current" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "p-3 rounded-[14px] border border-[#e5e7eb] bg-white shadow-[0_10px_25px_rgba(0,0,0,0.12)]",
            "w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[calc(100vw-24px)]"
          )}
          align="start"
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-2">
            {FORMATS.map((format) => (
              <button
                key={format.value}
                onClick={() => {
                  setSelectedFormat(format.value);
                }}
                className={cn(
                  "w-full h-14 flex items-center gap-3 px-3 rounded-lg hover:bg-[#f3f4f6] transition-colors text-left",
                  selectedFormat === format.value && "bg-[#eef2ff]"
                )}
              >
                <File className="w-5 h-5 text-[#6b7280]" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-[#111827]">
                    {format.label}
                  </span>
                  <span className="text-xs font-medium text-[#6b7280]">
                    {format.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="my-2.5 border-t border-[#e5e7eb]" />
          <div>
            <Button
              onClick={handleDownload}
              disabled={disabled || !selectedFormat}
              className={cn(
                "w-full h-11 rounded-xl bg-[#2563eb] text-white hover:bg-[#2563eb] hover:text-white",
                "font-medium hover:font-bold transition-colors",
                "disabled:bg-[#93c5fd] disabled:text-white disabled:opacity-70 disabled:cursor-not-allowed"
              )}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="inline-grid">
                <span className="col-start-1 row-start-1">Download</span>
                <span
                  aria-hidden="true"
                  className="col-start-1 row-start-1 font-bold invisible"
                >
                  Download
                </span>
              </span>
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
