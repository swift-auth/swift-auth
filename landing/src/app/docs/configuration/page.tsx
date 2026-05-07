import { CodeBlock } from '@/components/ui/CodeBlock';

const fullConfig = `export const auth = new SwiftAuth({
  // your server's base URL — required
  baseUrl: 'http://localhost:8000',

  // database adapter — required
  database: drizzleAdapter(db),

  // email and password auth
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    verifyEmail: false,
    minPasswordLength: 8,
    verificationTokenExpiry: 1000 * 60 * 60, // 1 hour
    verificationCallback: async ({ name, email, verificationToken }) => {},
    forgotPasswordCallback: async ({ name, email, resetToken }) => {},
  },

  // session settings
  session: {
    expiry: 1000 * 60 * 60 * 24, // 24 hours
  },

  // cookie settings
  cookies: {
    name: 'swift_auth_session_token',
    secure: true,
    sameSite: 'lax',
    domain: 'localhost',
  },

  // social providers
  socialProviders: {
    google: googleProvider({ ... }),
    github: gitHubProvider({ ... }),
  },
});`;

const baseUrlExample = `// development
baseUrl: 'http://localhost:8000'

// production
baseUrl: 'https://api.yourdomain.com'`;

const sessionConfig = `session: {
  // how long a session lasts in ms (default: 86400000 — 24 hours)
  expiry: 1000 * 60 * 60 * 24,
}`;

const cookiesConfig = `cookies: {
  // cookie name (default: 'swift_auth_session_token')
  name: 'swift_auth_session_token',

  // only send over HTTPS (default: true)
  secure: true,

  // controls cross-site cookie behaviour (default: 'lax')
  // 'lax' — sent on same-site requests and top-level navigations
  // 'strict' — only sent on same-site requests
  // 'none' — sent on all requests, requires secure: true
  sameSite: 'lax',

  // cookie domain (default: hostname from baseUrl)
  domain: 'localhost',
}`;

const emailConfig = `emailAndPassword: {
  enabled: true,                          // required
  autoSignIn: true,                       // default: true
  verifyEmail: false,                     // default: false
  minPasswordLength: 8,                   // default: 8
  verificationTokenExpiry: 3_600_000,     // default: 1 hour in ms
  verificationCallback: async () => {},   // required if verifyEmail is true
  forgotPasswordCallback: async () => {}, // required to use password reset
}`;

const socialConfig = `socialProviders: {
  google: googleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUrl: 'http://localhost:3000',
  }),
  github: gitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectUrl: 'http://localhost:3000',
  }),
}`;

const defaults = `{
  session: {
    expiry: 86_400_000,               // 24 hours
  },
  cookies: {
    name: 'swift_auth_session_token',
    secure: true,
    sameSite: 'lax',
    domain: 'hostname from baseUrl',
  },
  emailAndPassword: {
    autoSignIn: true,
    verifyEmail: false,
    minPasswordLength: 8,
    verificationTokenExpiry: 3_600_000, // 1 hour
  },
}`;

export default function ConfigurationPage() {
   return (
      <div>
         <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight">Configuration</h1>

         <p className="mt-4 max-w-[560px] text-lg leading-relaxed text-muted-foreground">
            A full reference for every option you can pass to <code>new SwiftAuth()</code>.
         </p>

         <hr className="my-8 border-border" />

         {/* Full config */}
         <h2 className="mt-12 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight">
            Full config
         </h2>
         <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            Here is an example showing every available option with its default value.
         </p>
         <div className="mt-5 rounded-xl border border-border bg-card overflow-hidden">
            <div className="border-b border-border px-5 py-2.5">
               <span className="font-mono text-xs text-muted-foreground">src/lib/auth.ts</span>
            </div>
            <CodeBlock lang="ts" code={fullConfig} />
         </div>

         <hr className="my-8 border-border" />

         {/* baseUrl */}
         <h2 className="mt-12 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight">
            baseUrl
         </h2>
         <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            Your server&apos;s base URL. Swift Auth uses this to build the OAuth callback URLs
            internally. It must match the URL your server is running on. Required — Swift Auth will
            throw at startup if this is missing.
         </p>
         <div className="mt-5 rounded-xl border border-border bg-card overflow-hidden">
            <CodeBlock lang="ts" code={baseUrlExample} />
         </div>

         <hr className="my-8 border-border" />

         {/* session */}
         <h2 className="mt-12 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight">
            session
         </h2>
         <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            Controls how long a session stays valid after it is created.
         </p>
         <div className="mt-5 rounded-xl border border-border bg-card overflow-hidden">
            <CodeBlock lang="ts" code={sessionConfig} />
         </div>
         <p className="mt-4 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            The expiry value is added to <code>Date.now()</code> when the session is created. Once
            expired, Swift Auth deletes the session automatically the next time it is accessed and
            returns a <code>SESSION_EXPIRED</code> error.
         </p>

         <hr className="my-8 border-border" />

         {/* cookies */}
         <h2 className="mt-12 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight">
            cookies
         </h2>
         <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            Controls the session cookie that Swift Auth sets after sign-in. The cookie is always{' '}
            <code>httpOnly</code> — this cannot be changed for security reasons.
         </p>
         <div className="mt-5 rounded-xl border border-border bg-card overflow-hidden">
            <CodeBlock lang="ts" code={cookiesConfig} />
         </div>
         <p className="mt-4 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            If you don&apos;t set <code>domain</code>, Swift Auth derives it automatically from your{' '}
            <code>baseUrl</code>. In most cases you don&apos;t need to set this manually.
         </p>
         <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            For cross-origin setups where your frontend and server are on different domains, set{' '}
            <code>sameSite: &apos;none&apos;</code> and <code>secure: true</code>, and make sure
            your server sends the correct CORS headers with <code>credentials: true</code>.
         </p>

         <hr className="my-8 border-border" />

         {/* emailAndPassword */}
         <h2 className="mt-12 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight">
            emailAndPassword
         </h2>
         <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            All options for email and password auth. See the{' '}
            <a
               href="/docs/authentication/email-password"
               className="text-foreground underline underline-offset-4 hover:text-foreground/80"
            >
               Email &amp; Password
            </a>{' '}
            page for a full walkthrough.
         </p>
         <div className="mt-5 rounded-xl border border-border bg-card overflow-hidden">
            <CodeBlock lang="ts" code={emailConfig} />
         </div>

         <hr className="my-8 border-border" />

         {/* socialProviders */}
         <h2 className="mt-12 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight">
            socialProviders
         </h2>
         <p className="mt-3 max-w-[560px] text-sm leading-relaxed text-muted-foreground">
            Add social sign-in providers to your config. Each provider is configured separately. See
            the individual provider pages for setup instructions.
         </p>
         <div className="mt-5 rounded-xl border border-border bg-card overflow-hidden">
            <CodeBlock lang="ts" code={socialConfig} />
         </div>

         <hr className="my-8 border-border" />

         {/* Defaults */}
         <h2 className="mt-12 scroll-m-20 border-b border-border pb-2 text-2xl font-semibold tracking-tight">
            Defaults reference
         </h2>
         <div className="mt-5 rounded-xl border border-border bg-card overflow-hidden">
            <CodeBlock lang="ts" code={defaults} />
         </div>
      </div>
   );
}
