import {
  Clock,
  Search,
  Accessibility,
  RefreshCw,
  Target,
  Sparkles,
} from "lucide-react";

export function Benefits() {
  const benefits = [
    {
      icon: Clock,
      title: "Save time",
      description: "Transcribe hours of audio in minutes with AI-powered accuracy",
    },
    {
      icon: Search,
      title: "Make content searchable",
      description: "Find specific information quickly by searching through text",
    },
    {
      icon: Accessibility,
      title: "Improve accessibility",
      description: "Make your audio content accessible to everyone, including those with hearing impairments",
    },
    {
      icon: RefreshCw,
      title: "Repurpose your content",
      description: "Transform podcasts, interviews, and videos into blog posts, articles, and more",
    },
    {
      icon: Target,
      title: "Increase accuracy",
      description: "Achieve up to 99.8% accuracy with advanced speech recognition technology",
    },
    {
      icon: Sparkles,
      title: "Powered by AI",
      description: "Leverage cutting-edge AI models for superior transcription quality",
    },
  ];

  return (
    <section id="about" className="w-full py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-12">
            {/* Whisper Logo Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 mb-4">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                Powered by Whisper AI |{" "}
                <a
                  href="https://www.shasuvathanan.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Shasu Vathanan
                </a>
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Convert Audio to Text?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Unlock the full potential of your audio and video content
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="flex gap-4 p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
