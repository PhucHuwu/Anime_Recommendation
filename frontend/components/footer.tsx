import Link from "next/link"
import { Heart, Github, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gradient">AnimeRec</h3>
            <p className="text-sm text-muted-foreground">
              Your personalized anime recommendation system powered by AI.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/browse" className="hover:text-primary transition-colors">
                  Browse
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-primary transition-colors">
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/admin" className="hover:text-primary transition-colors">
                  Admin
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  API Docs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2025 AnimeRec. Built with <Heart className="inline h-4 w-4 text-destructive fill-destructive" /> for anime
            fans.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
