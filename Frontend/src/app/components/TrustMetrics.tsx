import { Star, Globe, Lock } from "lucide-react";

export function TrustMetrics() {
  const metrics = [
    {
      icon: Star,
      label: "99.8% Accuracy",
      description: "Industry-leading transcription accuracy",
    },
    {
      icon: Globe,
      label: "98+ Languages (In Progress)",
      description: "This is an open-source project. English is supported today; community-driven language expansion is planned.",
    },
    {
      icon: Lock,
      label: "Private & Secure",
      description: "Your data is encrypted and never shared",
    },
  ];

  return (
    <section className="w-full py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-blue-50/50 border border-blue-100"
              >
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{metric.label}</h4>
                  <p className="text-xs text-muted-foreground hidden lg:block">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}