export type Providers = 'postgres' | 'sqlite' | 'mysql';

export interface DrizzleAdapterOptions {
   db: any;
   provider: Providers;
}
