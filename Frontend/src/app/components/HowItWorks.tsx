import { Upload, Globe, Download } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Upload,
      title: "Upload Your Audio",
      description:
        "Supports MP3, WAV, M4A, AAC, FLAC, MP4, TS. Upload files up to 200 MB directly from your device.",
    },
    {
      number: 2,
      icon: Globe,
      title: "Select Your Language",
      description:
        "Auto-detect (English). Multi-language support coming soon. Auto-detect by default. English supported today. Additional languages will be added as this open-source project evolves.",
    },
    {
      number: 3,
      icon: Download,
      title: "Download Your Transcript",
      description:
        "Export your transcript as Word (DOCX), Plain Text (TXT), or Subtitle File (SRT) format.",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-white to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three simple steps to convert your audio to text
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative flex flex-col items-center text-center p-6"
                >
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -left-2 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                    <Icon className="w-10 h-10 text-blue-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}