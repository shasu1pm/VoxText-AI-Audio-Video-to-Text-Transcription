import { Github, Linkedin, Coffee } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and Copyright - Single Line */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.reload();
              }}
              className="cursor-pointer"
            >
              <img
                src="/logo/VoxText_Logo.png"
                alt="VoxText Logo"
                className="h-6 md:h-7 w-auto object-contain"
              />
            </a>
            <span className="text-sm text-muted-foreground">
              © 2026-2027 Vox Text |{" "}
              <a
                href="https://www.shasuvathanan.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground transition-colors"
              >
                Shasu Vathanan
              </a>
              . All rights reserved.
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/shasu1pm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/shasuvathanan/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://buymeacoffee.com/shasuvathanan"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Buy Me a Coffee"
            >
              <Coffee className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}