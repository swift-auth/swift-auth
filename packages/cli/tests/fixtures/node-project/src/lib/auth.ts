import { SwiftAuth } from 'swift-auth';
import { mockAdapter } from '../../../../utils/mockAdapter';

export default new SwiftAuth({
   baseUrl: 'http://localhost:3000',
   database: mockAdapter,
   emailAndPassword: {
      enabled: true,
      verifyEmail: true,
   },
});
