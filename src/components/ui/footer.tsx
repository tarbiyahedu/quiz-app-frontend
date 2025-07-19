import Link from "next/link";

export default function Footer() {
  return (
    // Footer
    <footer className="border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © 2025 Tarbiyah Quiz. All rights reserved. Developed by <span className="text-muted-foreground">Shoaib Hasan Sohag</span>
          </p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
