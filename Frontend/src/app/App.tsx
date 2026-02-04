/**
 * Vox Text - Audio/Video to Text Transcription Application
 * 
 * A complete SaaS landing page with functional transcription UI
 * featuring Step 1 (Upload) → Step 2 (Transcribe) flow with state management.
 * 
 * Key Features:
 * - File upload with drag & drop support
 * - Language selection (99+ languages with search)
 * - Real-time upload progress tracking
 * - File validation (size, type)
 * - Download transcripts in multiple formats (DOCX, TXT, SRT)
 * - Fully responsive design
 * - Toast notifications for user feedback
 */

import { Toaster } from "@/app/components/ui/sonner";
import { Navigation } from "@/app/components/Navigation";
import { Hero } from "@/app/components/Hero";
import { TranscriptionCard } from "@/app/components/TranscriptionCard";
import { TrustMetrics } from "@/app/components/TrustMetrics";
import { HowItWorks } from "@/app/components/HowItWorks";
import { Benefits } from "@/app/components/Benefits";
import { Footer } from "@/app/components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <Navigation />

      {/* Hero Section */}
      <Hero />

      {/* Main Transcription Card */}
      <TranscriptionCard />

      {/* Trust Metrics */}
      <TrustMetrics />

      {/* How It Works */}
      <HowItWorks />

      {/* Benefits Section */}
      <Benefits />

      {/* Footer */}
      <Footer />

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}
