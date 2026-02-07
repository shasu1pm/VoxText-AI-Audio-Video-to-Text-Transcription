import { Badge } from "@/app/components/ui/badge";

export function Hero() {
  return (
    <section className="w-full pt-3 md:pt-4 pb-[0.45rem] md:pb-[0.6rem] lg:pb-[0.9rem]">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {/* Top Badge */}
        <Badge
          variant="secondary"
          className="mb-4 md:mb-6 rounded-full px-4 py-2 text-xs md:text-sm bg-blue-50 text-blue-700 border-blue-200"
        >
          🚀 1,250,000+ Hours Transcribed
        </Badge>

        {/* Main Heading */}
        <h2 className="text-[1.3125rem] md:text-[1.575rem] lg:text-[2.1rem] xl:text-[2.625rem] font-bold mb-4 md:mb-6 leading-tight">
          <span className="text-blue-600">
            Convert your Audio/Video File & YouTube Links to Text For Free
          </span>
        </h2>

        {/* Subheading */}
        <p className="text-[0.7rem] md:text-[0.7875rem] lg:text-[0.875rem] text-muted-foreground max-w-2xl mx-auto">
          Free AI Transcription of your uploaded Audio/Video & YouTube Transcript Generator.
          <br />
          Instantly transcribe recordings or paste a YouTube link.
        </p>
      </div>
    </section>
  );
}
