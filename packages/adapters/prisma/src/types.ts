export type Providers = 'postgres' | 'sqlite' | 'mysql';

export interface PrismaAdapterOptions {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   db: any;
   provider: Providers;
}
