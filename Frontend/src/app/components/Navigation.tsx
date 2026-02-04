import { Coffee, Github, Linkedin } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 min-h-16 md:h-16 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 md:gap-0 py-2 md:py-0">
        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
          className="flex items-center shrink-0 cursor-pointer"
        >
          <img
            src="/logo/VoxText_Logo.png"
            alt="VoxText Logo"
            className="h-8 md:h-10 w-auto object-contain"
          />
        </a>

        {/* Navigation Links */}
        <div className="flex flex-nowrap items-center justify-center md:justify-start gap-1.5 md:gap-8 w-full md:w-auto order-3 md:order-none mt-1 md:mt-0">
          <a
            href="https://www.shasuvathanan.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm font-medium text-white bg-[#2563eb] hover:bg-blue-700 transition-colors rounded-[5px] inline-flex items-center justify-center min-h-10 px-2.5 py-1.5 md:px-2.5 md:py-1.5 whitespace-nowrap"
          >
            Shasu Vathanan
          </a>
          <a
            href="#about"
            className="text-xs md:text-sm font-medium text-foreground/80 hover:text-foreground transition-colors inline-flex items-center justify-center min-h-10 px-1.5 py-1.5 md:px-0 md:py-0 whitespace-nowrap"
          >
            ABOUT
          </a>
          <a
            href="https://www.linkedin.com/in/shasuvathanan/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm font-medium text-foreground/80 hover:text-foreground transition-colors inline-flex items-center gap-1.5 md:gap-2 min-h-10 px-1.5 py-1.5 md:px-0 md:py-0 whitespace-nowrap"
          >
            <Linkedin className="w-3 h-3 md:w-4 md:h-4" />
            LINKEDIN
          </a>
          <a
            href="https://github.com/shasu1pm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs md:text-sm font-medium text-foreground/80 hover:text-foreground transition-colors inline-flex items-center gap-1.5 md:gap-2 min-h-10 px-1.5 py-1.5 md:px-0 md:py-0 whitespace-nowrap"
          >
            <Github className="w-3 h-3 md:w-4 md:h-4" />
            GITHUB
          </a>
        </div>

        {/* CTA Button */}
        <a
          href="https://buymeacoffee.com/shasuvathanan"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl hidden md:flex">
            <Coffee className="w-4 h-4 mr-2" />
            Buy Me a Coffee
          </Button>
        </a>

        {/* Mobile CTA Button */}
        <a
          href="https://buymeacoffee.com/shasuvathanan"
          target="_blank"
          rel="noopener noreferrer"
          className="md:hidden order-2"
        >
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
            <Coffee className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </nav>
  );
}
