export type Providers = 'postgres' | 'sqlite' | 'mysql';

export interface DrizzleAdapterOptions {
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   db: any;
   provider: Providers;
}
