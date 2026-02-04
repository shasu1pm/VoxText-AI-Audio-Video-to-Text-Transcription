import { useRef, useState } from "react";
import { Upload, RotateCcw, Languages, AlertCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { UploadArea } from "@/app/components/UploadArea";
import { FileLoaderCard } from "@/app/components/FileLoaderCard";
import { DownloadDropdown } from "@/app/components/DownloadDropdown";
import { toast } from "sonner";
import { Document, Packer, Paragraph, TextRun } from "docx";

type UploadStatus = "idle" | "uploading" | "processing" | "completed" | "error";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
const ENGLISH_ONLY_MESSAGE =
  "Sorry: We currently support transcription in English only. We're actively working with the community to add 98+ other languages. Please click \"Reset\" and try again with an English recording.";
const DETECTION_ERROR_MESSAGE =
  "Language detection failed. Please try again.";
const ALLOWED_LANGUAGE_CODES = ["en", "en-us", "en-gb", "english"];
const DEFAULT_TRANSCRIBE_ENDPOINT = "/api/transcribe";
const DEFAULT_TRANSCRIBE_FALLBACK = "/transcribe";
const FALLBACK_LOCAL_ENDPOINTS = [
  "http://localhost:8000/transcribe",
  "http://127.0.0.1:8000/transcribe",
  "http://localhost:8000/api/transcribe",
  "http://127.0.0.1:8000/api/transcribe",
];
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL;
const TRANSCRIBE_ENDPOINT =
  import.meta.env.VITE_TRANSCRIBE_URL || DEFAULT_TRANSCRIBE_ENDPOINT;
const TRANSCRIBE_STATUS_ENDPOINT =
  import.meta.env.VITE_TRANSCRIBE_STATUS_URL || "";
const POLL_INTERVAL_MS = 1500;
const MAX_POLL_DURATION_MS = 120000;

type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

class TranscriptionNetworkError extends Error {
  endpoints: string[];

  constructor(endpoints: string[], message: string) {
    super(message);
    this.name = "TranscriptionNetworkError";
    this.endpoints = endpoints;
  }
}

type TranscriptionResult = {
  text: string;
  language: string;
  segments: TranscriptSegment[] | null;
  srt: string | null;
};

const ALLOWED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-m4a",
  "audio/aac",
  "audio/flac",
  "video/mp4",
  "video/mp2t",
  "audio/mp3",
  "audio/m4a",
];

export function TranscriptionCard() {
  const [detectedLanguage, setDetectedLanguage] = useState("—");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [languageError, setLanguageError] = useState(false);
  const [isEnglishDetected, setIsEnglishDetected] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptSegments, setTranscriptSegments] = useState<TranscriptSegment[] | null>(null);
  const [transcriptSrt, setTranscriptSrt] = useState<string | null>(null);
  const uploadIntervalRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File size exceeds 200 MB limit");
      return false;
    }

    // Check file type
    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const isValidExtension = ["mp3", "wav", "m4a", "aac", "flac", "mp4", "ts"].includes(
      fileExtension || ""
    );
    const isValidType = ALLOWED_TYPES.includes(file.type);

    if (!isValidExtension && !isValidType) {
      setErrorMessage("Unsupported file format. Please upload an audio or video file.");
      return false;
    }

    return true;
  };

  const stopProgress = () => {
    if (uploadIntervalRef.current) {
      window.clearInterval(uploadIntervalRef.current);
      uploadIntervalRef.current = null;
    }
  };

  const startProgress = () => {
    stopProgress();
    setUploadProgress(5);
    uploadIntervalRef.current = window.setInterval(() => {
      setUploadProgress((prev) => {
        const next = Math.min(90, prev + Math.random() * 8 + 3);
        if (next >= 90) {
          setUploadStatus((status) =>
            status === "uploading" ? "processing" : status
          );
        }
        return next;
      });
    }, 400);
  };

  const delay = (ms: number, signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(resolve, ms);
      if (signal) {
        signal.addEventListener(
          "abort",
          () => {
            window.clearTimeout(timeout);
            reject(new DOMException("Aborted", "AbortError"));
          },
          { once: true }
        );
      }
    });

  const getEndpointCandidates = () => {
    const explicit = import.meta.env.VITE_TRANSCRIBE_URL;
    const endpoints = [TRANSCRIBE_ENDPOINT];
    if (!explicit && TRANSCRIBE_ENDPOINT !== DEFAULT_TRANSCRIBE_FALLBACK) {
      endpoints.push(DEFAULT_TRANSCRIBE_FALLBACK);
    }
    if (BASE_API_URL) {
      const trimmed = String(BASE_API_URL).replace(/\/$/, "");
      endpoints.push(`${trimmed}/transcribe`);
      endpoints.push(`${trimmed}/api/transcribe`);
    }
    if (!explicit && typeof window !== "undefined") {
      const host = window.location.hostname;
      if (host === "localhost" || host === "127.0.0.1") {
        FALLBACK_LOCAL_ENDPOINTS.forEach((endpoint) => endpoints.push(endpoint));
      }
    }
    return Array.from(new Set(endpoints));
  };

  const extractErrorMessage = async (response: Response) => {
    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        const message =
          data?.detail || data?.error || data?.message || data?.reason || "";
        if (message) return String(message);
      }
      const text = await response.text();
      if (text) return text.slice(0, 200);
    } catch (error) {
      return "";
    }
    return "";
  };

  const requestTranscriptionOnce = async (
    endpoint: string,
    file: File,
    signal?: AbortSignal
  ): Promise<{
    payload: unknown;
    normalized: TranscriptionResult;
    statusBase: string;
  }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("audio", file);
    formData.append("media", file);
    formData.append("upload", file);
    formData.append("task", "transcribe");

    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
      signal,
    });
    if (!response.ok) {
      const detail = await extractErrorMessage(response);
      throw new Error(detail || `Transcription failed (${response.status})`);
    }
    const payload = await response.json();
    return { payload, normalized: normalizeResult(payload), statusBase: endpoint };
  };

  const normalizeSegments = (segments: unknown) => {
    if (!Array.isArray(segments)) return null;
    const normalized = segments
      .map((segment) => {
        if (!segment || typeof segment !== "object") return null;
        const raw = segment as Record<string, unknown>;
        const start = Number(raw.start ?? raw.start_time ?? raw.startTime);
        const end = Number(raw.end ?? raw.end_time ?? raw.endTime);
        const text = String(raw.text ?? raw.transcript ?? raw.content ?? "").trim();
        if (!Number.isFinite(start) || !Number.isFinite(end) || !text) return null;
        return { start, end, text };
      })
      .filter(Boolean) as TranscriptSegment[];
    return normalized.length ? normalized : null;
  };

  const extractPayload = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return payload;
    const obj = payload as Record<string, unknown>;
    return (
      obj.result ??
      obj.data ??
      obj.transcript ??
      obj.output ??
      obj
    );
  };

  const extractText = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return "";
    const obj = payload as Record<string, unknown>;
    return String(
      obj.text ??
        obj.transcript ??
        obj.transcription ??
        obj.content ??
        ""
    ).trim();
  };

  const extractLanguage = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return "";
    const obj = payload as Record<string, unknown>;
    return String(
      obj.language ??
        obj.language_code ??
        obj.lang ??
        obj.detected_language ??
        ""
    ).trim();
  };

  const extractSrt = (payload: unknown) => {
    if (!payload || typeof payload !== "object") return "";
    const obj = payload as Record<string, unknown>;
    return String(obj.srt ?? obj.subtitle ?? obj.subtitles ?? "").trim();
  };

  const normalizeResult = (payload: unknown): TranscriptionResult => {
    const unwrapped = extractPayload(payload);
    const text = extractText(unwrapped);
    const language = extractLanguage(unwrapped);
    const srt = extractSrt(unwrapped);
    const segments =
      normalizeSegments((unwrapped as Record<string, unknown>)?.segments) ??
      normalizeSegments((unwrapped as Record<string, unknown>)?.chunks) ??
      normalizeSegments((unwrapped as Record<string, unknown>)?.sentences) ??
      null;

    return {
      text,
      language,
      segments,
      srt: srt || null,
    };
  };

  const pollTranscription = async (
    url: string,
    signal?: AbortSignal
  ): Promise<TranscriptionResult> => {
    const startTime = Date.now();
    while (Date.now() - startTime < MAX_POLL_DURATION_MS) {
      if (signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      const response = await fetch(url, { signal });
      if (!response.ok) {
        const detail = await extractErrorMessage(response);
        throw new Error(detail || "Transcription failed");
      }
      const payload = await response.json();
      const status = String(
        (payload?.status ?? payload?.state ?? payload?.result?.status ?? "")
      ).toLowerCase();
      const normalized = normalizeResult(payload);
      if (status) {
        if (["completed", "succeeded", "success", "done"].includes(status)) {
          return normalized;
        }
        if (["failed", "error"].includes(status)) {
          throw new Error("Transcription failed");
        }
      }
      if (normalized.text || normalized.segments || normalized.srt) {
        return normalized;
      }
      await delay(POLL_INTERVAL_MS, signal);
    }
    throw new Error("Transcription timed out");
  };

  const requestTranscription = async (
    file: File,
    signal?: AbortSignal
  ): Promise<TranscriptionResult> => {
    const endpoints = getEndpointCandidates();
    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const { payload, normalized, statusBase } = await requestTranscriptionOnce(
          endpoint,
          file,
          signal
        );
        const statusUrl =
          (payload as Record<string, unknown>)?.status_url ??
          (payload as Record<string, unknown>)?.poll_url ??
          (payload as Record<string, unknown>)?.statusUrl ??
          (payload as Record<string, unknown>)?.result?.status_url ??
          (payload as Record<string, unknown>)?.result?.poll_url ??
          (payload as Record<string, unknown>)?.result?.statusUrl;
        if (typeof statusUrl === "string" && statusUrl) {
          return pollTranscription(statusUrl, signal);
        }

        const jobId =
          (payload as Record<string, unknown>)?.job_id ??
          (payload as Record<string, unknown>)?.id ??
          (payload as Record<string, unknown>)?.task_id ??
          (payload as Record<string, unknown>)?.result?.job_id ??
          (payload as Record<string, unknown>)?.result?.id ??
          (payload as Record<string, unknown>)?.result?.task_id;
        if (typeof jobId === "string" || typeof jobId === "number") {
          const base =
            TRANSCRIBE_STATUS_ENDPOINT || statusBase.replace(/\/$/, "");
          const pollUrl = `${base}/${jobId}`;
          return pollTranscription(pollUrl, signal);
        }

        // Accept response if it has content OR if language was detected (for non-English rejection)
        if (normalized.text || normalized.segments || normalized.srt || normalized.language) {
          return normalized;
        }
      } catch (error) {
        if (signal?.aborted) {
          throw error;
        }
        lastError = error as Error;
      }
    }
    const lastMessage = lastError?.message || "";
    const isNetworkError =
      lastError?.name === "TypeError" ||
      lastMessage.toLowerCase().includes("failed to fetch") ||
      lastMessage.toLowerCase().includes("networkerror");
    if (isNetworkError) {
      throw new TranscriptionNetworkError(
        endpoints,
        "Unable to reach the transcription service. Check that the API is running and accessible."
      );
    }
    throw lastError ?? new Error("Transcription failed");
  };

  const normalizeLanguageLabel = (language: string) => {
    const normalized = language.trim();
    if (!normalized) return "Unknown";
    const lower = normalized.toLowerCase();
    if (lower === "en" || lower === "english") return "English";
    if (lower === "en-us") return "English (US)";
    if (lower === "en-gb") return "English (UK)";
    if (lower === "es") return "Spanish";
    if (lower === "fr") return "French";
    if (lower === "de") return "German";
    if (lower === "pt") return "Portuguese";
    if (lower === "ru") return "Russian";
    if (lower === "ar") return "Arabic";
    if (lower === "hi") return "Hindi";
    if (lower === "ta") return "Tamil";
    if (lower === "te") return "Telugu";
    if (lower === "ko") return "Korean";
    if (lower === "ja") return "Japanese";
    if (lower === "zh") return "Chinese";
    if (lower === "vi") return "Vietnamese";
    if (lower === "th") return "Thai";
    if (lower === "tr") return "Turkish";
    return normalized;
  };

  const isEnglishLanguage = (language: string) => {
    const lower = language.trim().toLowerCase();
    return ALLOWED_LANGUAGE_CODES.includes(lower);
  };

  const handleFileSelect = (file: File) => {
    setLanguageError(false);
    setIsEnglishDetected(false);
    setDetectedLanguage("—");
    setErrorMessage("");
    setTranscriptText("");
    setTranscriptSegments(null);
    setTranscriptSrt(null);
    if (!validateFile(file)) {
      setUploadStatus("error");
      setSelectedFile(file);
      return;
    }

    setSelectedFile(file);
    setUploadStatus("uploading");
    setUploadProgress(0);
    startProgress();
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    void requestTranscription(file, controller.signal)
      .then((result) => {
        stopProgress();
        setUploadProgress(100);

        if (!result.language) {
          setUploadStatus("error");
          setDetectedLanguage("Unknown");
          setLanguageError(true);
          setIsEnglishDetected(false);
          setErrorMessage(DETECTION_ERROR_MESSAGE);
          toast.error(DETECTION_ERROR_MESSAGE);
          return;
        }

        const label = normalizeLanguageLabel(result.language);
        setDetectedLanguage(label);

        if (!isEnglishLanguage(result.language)) {
          setUploadStatus("error");
          setLanguageError(true);
          setIsEnglishDetected(false);
          setErrorMessage(ENGLISH_ONLY_MESSAGE);
          toast.error(ENGLISH_ONLY_MESSAGE);
          return;
        }
        setIsEnglishDetected(true);

        const derivedText =
          result.text ||
          (result.segments ? result.segments.map((segment) => segment.text).join(" ").trim() : "");

        if (!derivedText) {
          setUploadStatus("error");
          setLanguageError(false);
          setErrorMessage("Transcription returned no text.");
          toast.error("Transcription returned no text.");
          return;
        }

        setTranscriptText(derivedText);
        setTranscriptSegments(result.segments);
        setTranscriptSrt(result.srt);
        setLanguageError(false);
        setIsEnglishDetected(true);
        setErrorMessage("");
        setUploadStatus("completed");
        toast.success("Transcript is ready!");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        stopProgress();
        setUploadStatus("error");
        if (error instanceof TranscriptionNetworkError) {
          const message = `${error.message} Tried: ${error.endpoints.join(", ")}`;
          setErrorMessage(message);
          toast.error(error.message);
          return;
        }
        const message =
          error instanceof Error && error.message
            ? error.message
            : "Transcription failed. Please try again.";
        setErrorMessage(message);
        toast.error(message);
      });
  };

  const handleReset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopProgress();
    setSelectedFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setErrorMessage("");
    setDetectedLanguage("—");
    setLanguageError(false);
    setIsEnglishDetected(false);
    setTranscriptText("");
    setTranscriptSegments(null);
    setTranscriptSrt(null);
  };

  const formatSrtTimestamp = (seconds: number) => {
    const clamped = Math.max(0, seconds);
    const hours = Math.floor(clamped / 3600);
    const minutes = Math.floor((clamped % 3600) / 60);
    const secs = Math.floor(clamped % 60);
    const millis = Math.floor((clamped - Math.floor(clamped)) * 1000);
    const pad = (value: number, size: number) => String(value).padStart(size, "0");
    return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(secs, 2)},${pad(millis, 3)}`;
  };

  const buildSrtFromSegments = (segments: TranscriptSegment[]) => {
    const lines: string[] = [];
    segments.forEach((segment, index) => {
      lines.push(
        String(index + 1),
        `${formatSrtTimestamp(segment.start)} --> ${formatSrtTimestamp(segment.end)}`,
        segment.text,
        ""
      );
    });
    return lines.join("\n").trim();
  };

  const handleDownload = async (format: "docx" | "txt" | "srt") => {
    if (!selectedFile) return false;
    if (!transcriptText && format !== "srt") return false;
    if (languageError || !isEnglishDetected) return false;

    const formatExtension = format.toLowerCase();
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    const downloadName = `${baseName} (voxtext).${formatExtension}`;

    try {
      let blob: Blob;

      if (format === "docx") {
        // Generate proper Word document
        const paragraphs = transcriptText.split("\n").map(
          (line) =>
            new Paragraph({
              children: [new TextRun({ text: line || " ", size: 24 })],
              spacing: { after: 200 },
            })
        );

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: paragraphs,
            },
          ],
        });

        blob = await Packer.toBlob(doc);
      } else if (format === "srt") {
        const srtContent =
          transcriptSrt || (transcriptSegments ? buildSrtFromSegments(transcriptSegments) : "");
        if (!srtContent) {
          toast.error("SRT export is unavailable.");
          return false;
        }
        blob = new Blob([srtContent], { type: "text/plain" });
      } else {
        // TXT format
        blob = new Blob([transcriptText], { type: "text/plain" });
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Transcript downloaded");
      return true;
    } catch (error) {
      toast.error("Download failed. Please try again.");
      return false;
    }
  };

  return (
    <section className="w-full pt-4 md:pt-5 pb-8">
      <div className="container mx-auto px-4">
        <Card className="max-w-5xl mx-auto p-6 md:p-8 shadow-xl rounded-3xl border-2">
          <input
            id="file-input-hidden"
            type="file"
            accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.flac,.mp4,.ts"
            className="hidden"
            disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                handleFileSelect(file);
              }
              event.currentTarget.value = "";
            }}
          />
          {/* Top Action Row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* File Upload Button */}
            <Button
              variant="ghost"
              className="bg-[#2563eb] text-white hover:bg-[#2563eb] hover:text-white font-normal hover:font-bold transition-colors"
              onClick={() => document.getElementById("file-input-hidden")?.click()}
              disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
            >
              <Upload className="w-4 h-4 mr-2" />
              <span className="inline-grid">
                <span className="col-start-1 row-start-1">File Upload</span>
                <span
                  aria-hidden="true"
                  className="col-start-1 row-start-1 font-bold invisible"
                >
                  File Upload
                </span>
              </span>
            </Button>

            {/* Language Detected Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
              languageError 
                ? "bg-destructive/10 text-destructive border border-destructive/20" 
                : "bg-muted/40 text-muted-foreground"
            }`}>
              <Languages className="w-4 h-4" />
              <span>Language Detected: {detectedLanguage}</span>
            </div>

            {/* Spacer */}
            <div className="flex-1 hidden md:block" />

            {/* Download Button */}
            <DownloadDropdown
              disabled={
                uploadStatus !== "completed" ||
                !selectedFile ||
                languageError ||
                !isEnglishDetected
              }
              onDownload={handleDownload}
            />

            {/* Reset Button */}
            {(selectedFile || uploadStatus !== "idle" || languageError) && (
              <Button
                variant="ghost"
                className="bg-[#d3e3fd] hover:bg-[#ea4335] hover:text-white font-normal hover:font-bold transition-colors"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                <span className="inline-grid">
                  <span className="col-start-1 row-start-1">Reset</span>
                  <span
                    aria-hidden="true"
                    className="col-start-1 row-start-1 font-bold invisible"
                  >
                    Reset
                  </span>
                </span>
              </Button>
            )}
          </div>

          {/* Language Error Message */}
          {languageError && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive mb-1">English only</h4>
                <p className="text-sm text-destructive/80">{ENGLISH_ONLY_MESSAGE}</p>
              </div>
            </div>
          )}

          {/* Upload Area / File Loader */}
          <div className="mt-6">
            {uploadStatus === "idle" ? (
              <UploadArea onFileSelect={handleFileSelect} />
            ) : selectedFile ? (
              <FileLoaderCard
                file={selectedFile}
                progress={uploadProgress}
                status={uploadStatus}
                onRemove={handleReset}
                errorMessage={errorMessage}
              />
            ) : null}
          </div>
        </Card>
      </div>
    </section>
  );
}
