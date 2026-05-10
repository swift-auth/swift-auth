import { AnimatedIllustration } from '@/components/AnimatedIllustrator';
import { CodeBlock } from '@/components/ui/CodeBlock';
import Navbar from '@/components/ui/Navbar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FEATURES = [
   {
      title: 'Multiple ORM Support',
      description:
         'Designed to support different ORMs through adapters, currently including Prisma and Drizzle.',
   },
   {
      title: 'Framework Agnostic',
      description:
         'Works across different server frameworks with support for Express today and future integrations planned for Next.js and Hono.',
   },
   {
      title: 'React Client Library',
      description:
         'Dedicated React utilities for client-side session management and authentication state.',
   },
   {
      title: 'Type-safe by Default',
      description:
         'Built around TypeScript with explicit APIs designed to stay predictable and composable.',
   },
];

export default function Home() {
   return (
      <main className="min-h-screen w-full">
         <Navbar />
         {/* Hero */}
         <section>
            <div className="mx-auto max-w-6xl px-6 pt-28 pb-24">
               <div className="flex flex-col gap-20 lg:flex-row lg:items-center">
                  {/* Left */}
                  <div className="flex-1 min-w-0 space-y-7">
                     <p className="text-xs font-mono tracking-[0.24em] text-muted-foreground uppercase">
                        Open Source · MIT License
                     </p>

                     <div className="space-y-5">
                        <h1 className="text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
                           Auth that feels
                           <br />
                           simple again.
                        </h1>

                        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                           Type-safe authentication built for developers who want simplicity,
                           flexibility, and control without hidden abstractions or framework
                           lock-in.
                        </p>
                     </div>

                     <div className="flex flex-wrap items-center gap-3">
                        <Button asChild size="lg">
                           <Link href="/docs">Quick Start</Link>
                        </Button>

                        <Button asChild variant="outline" size="lg">
                           <Link href="/docs">Documentation</Link>
                        </Button>
                     </div>
                  </div>

                  {/* Right */}
                  <div className="hidden flex-1 items-center justify-center lg:flex">
                     <AnimatedIllustration />
                  </div>
               </div>
            </div>
         </section>

         {/* Why */}
         <section className="border-t border-border">
            <div className="mx-auto max-w-6xl px-6 py-24">
               <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr]">
                  {/* Left */}
                  <div className="space-y-4">
                     <p className="text-xs font-mono tracking-[0.24em] text-muted-foreground uppercase">
                        Why Authio
                     </p>

                     <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                        Built from frustration
                        <br />
                        with existing auth libraries.
                     </h2>
                  </div>

                  {/* Right */}
                  <div className="space-y-6 text-[15px] leading-relaxed text-muted-foreground">
                     <p>
                        Most authentication libraries either hide too much behind abstractions or
                        force developers into rigid architectures and framework-specific patterns.
                     </p>

                     <p>
                        Authio was built to stay predictable. A small, type-safe core with adapters
                        and handlers that fit naturally into tools developers already use.
                     </p>

                     <p>
                        No generated code. No unnecessary complexity. Just clean, understandable
                        authentication designed to scale with your application.
                     </p>
                  </div>
               </div>
            </div>
         </section>

         {/* Features / Current State */}
         <section className="border-t border-border">
            <div className="mx-auto max-w-6xl px-6 py-24">
               {/* Top */}
               <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl space-y-4">
                     <p className="text-xs font-mono tracking-[0.24em] text-muted-foreground uppercase">
                        Current State
                     </p>

                     <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                        An actively evolving
                        <br />
                        authentication toolkit.
                     </h2>

                     <p className="text-sm leading-relaxed text-muted-foreground">
                        Authio is currently under active development. The initial release focuses on
                        a small, stable foundation with support for Node.js, Express, Prisma,
                        Drizzle, and a dedicated React client library for client-side session
                        handling.
                     </p>
                  </div>

                  {/* GitHub CTA */}
                  <div className="flex flex-wrap items-center gap-3">
                     <Button asChild size="lg">
                        <Link href="" target="_blank">
                           Star on GitHub
                        </Link>
                     </Button>

                     <Button asChild variant="outline" size="lg">
                        <Link href="" target="_blank">
                           Contribute
                        </Link>
                     </Button>
                  </div>
               </div>

               {/* Feature Cards */}
               <div className="mt-16 grid gap-5 md:grid-cols-2">
                  {FEATURES.map((feature) => (
                     <div
                        key={feature.title}
                        className="group rounded-2xl border border-border bg-card p-6 transition-all hover:bg-muted/30"
                     >
                        <div className="space-y-4">
                           {/* top */}
                           <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-foreground">
                                 {feature.title}
                              </h3>

                              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-foreground/70" />
                           </div>

                           {/* body */}
                           <p className="text-sm leading-relaxed text-muted-foreground">
                              {feature.description}
                           </p>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Bottom note */}
               <div className="mt-14 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                     Authio is being built in the open with a focus on simplicity, explicit APIs,
                     and long-term maintainability. Feedback, issues, and contributions are welcome.
                  </p>
               </div>
            </div>
         </section>

         {/* Code Example */}
         <section className="border-t border-border">
            <div className="mx-auto max-w-6xl px-6 py-24">
               <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
                  {/* Left */}
                  <div className="space-y-5">
                     <p className="text-xs font-mono tracking-[0.24em] text-muted-foreground uppercase">
                        Quick Setup
                     </p>

                     <h2 className="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                        Designed to stay
                        <br />
                        straightforward.
                     </h2>

                     <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                        Authio keeps configuration explicit and readable while staying fully
                        type-safe and composable.
                     </p>
                  </div>

                  {/* Right */}
                  <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card">
                     {/* Top Bar */}
                     <div className="flex items-center justify-between border-b border-border px-5 py-3">
                        <div className="flex items-center gap-2">
                           <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                           <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                           <div className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                        </div>

                        <p className="text-xs font-mono text-muted-foreground">auth.ts</p>

                        <p className="text-xs text-muted-foreground">TypeScript</p>
                     </div>

                     {/* Code */}
                     <CodeBlock
                        code={`import { Authio } from '@authio/core';
import { drizzleAdapter } from '@authio/drizzle';
import {drizzleDb} from "../db/drizzle.ts"
import {
   googleProvider,
   gitHubProvider,
} from 'authio/providers';

export const auth = new Authio({
   database: drizzleAdapter({
   db: drizzleDb,
  provider: "postgres"
}),

   emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      verifyEmail: true,
   },

   socialProviders: {
      google: googleProvider({
         clientId: process.env.GOOGLE_CLIENT_ID!,
         clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),

      github: gitHubProvider({
         clientId: process.env.GITHUB_CLIENT_ID!,
         clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      }),
   },
});`}
                     />
                  </div>
               </div>
            </div>
         </section>

         {/* Footer */}
         <footer className="border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
               {/* Left */}
               <div className="space-y-2">
                  <p>Built for developers who prefer clarity over magic.</p>

                  <p className="text-xs text-muted-foreground">
                     Created and maintained by{' '}
                     <a
                        href="https://github.com/dipan-ck"
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:text-foreground"
                     >
                        Dipan Chakraborty
                     </a>
                  </p>
               </div>

               {/* Right */}
               <div className="flex flex-wrap items-center gap-5">
                  <Link href="/docs" className="transition-colors hover:text-foreground">
                     Docs
                  </Link>

                  <a
                     href="https://github.com/dipan-ck"
                     target="_blank"
                     rel="noreferrer"
                     className="transition-colors hover:text-foreground"
                  >
                     GitHub
                  </a>

                  <p>MIT License</p>
               </div>
            </div>
         </footer>
      </main>
   );
}
