import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
   return (
      <main className="min-h-screen flex items-center">
         <div className="mx-auto max-w-3xl px-6">
            {/* Content */}
            <div className="space-y-6">
               <h1 className="text-4xl font-semibold tracking-tight">
                  Auth that feels simple again.
               </h1>

               <p className="text-lg text-muted-foreground max-w-xl">
                  Type-safe authentication designed for simplicity, control, and great developer
                  experience. No magic. Just clean, predictable auth.
               </p>

               {/* Buttons */}
               <div className="flex gap-3">
                  <Button asChild>
                     <Link href="/docs">Quick Start</Link>
                  </Button>

                  <Button asChild variant="secondary">
                     <Link href="/docs">Documentation</Link>
                  </Button>
               </div>
            </div>
         </div>
      </main>
   );
}
