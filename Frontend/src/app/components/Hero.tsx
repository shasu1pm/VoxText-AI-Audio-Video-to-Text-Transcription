import { Badge } from "@/app/components/ui/badge";

export function Hero() {
  return (
    <section className="w-full pt-3 md:pt-4 pb-6 md:pb-8 lg:pb-12">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {/* Top Badge */}
        <Badge
          variant="secondary"
          className="mb-4 md:mb-6 rounded-full px-4 py-2 text-xs md:text-sm bg-blue-50 text-blue-700 border-blue-200"
        >
          🚀 1,250,000+ Hours Transcribed
        </Badge>

        {/* Main Heading */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight">
          <span className="text-blue-600">Convert Your Audio/Video to</span>
          <br />
          <span className="text-blue-600">Text for Free</span>
        </h1>

        {/* Subheading */}
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
          Transcribe your recordings in English with AI.
          <br />
          Get results in minutes, up to 99% accuracy.
        </p>
      </div>
    </section>
  );
}
