import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
   return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
         <path d="M12 2C6.477 2 2 6.484 2 12.02c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.158-1.11-1.467-1.11-1.467-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.03-2.688-.103-.253-.447-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.414-.012 2.742 0 .268.18.58.688.481A10.025 10.025 0 0022 12.02C22 6.484 17.523 2 12 2z" />
      </svg>
   );
}

export default function Navbar() {
   return (
      <header className="w-full border-b">
         <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
            {/* Left - Logo */}
            <Link href="/" className="flex items-center">
               <Image src="/logo.svg" alt="swift-auth logo" width={130} height={130} priority />
            </Link>

            {/* Right - GitHub Button */}
            <Button asChild variant="outline">
               <Link
                  href="https://github.com/dipan-ck/swift-auth"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
               >
                  <GitHubIcon className="mr-2 h-4 w-4" />
                  GitHub
               </Link>
            </Button>
         </div>
      </header>
   );
}
