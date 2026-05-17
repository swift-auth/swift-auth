import { setupNodeServer } from '../../src/setupServer.js';

const server = setupNodeServer({ database: 'drizzle', provider: 'postgres' });

export async function setup() {
   server.spinUp();
}

export async function teardown() {
   server.tearDown();
}
