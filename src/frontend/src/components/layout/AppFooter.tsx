import { Heart } from 'lucide-react';

export default function AppFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30 py-8 mt-16">
      <div className="container px-4">
        <div className="text-center text-sm text-muted-foreground">
          © 2026. Built with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> using{' '}
          <a 
            href="https://caffeine.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-medium hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
