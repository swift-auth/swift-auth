import { SwiftAuth } from 'swift-auth';
import { mockAdapter } from '../../../../utils/mockAdapter';

export default new SwiftAuth({
   database: mockAdapter,
   emailAndPassword: {
      enabled: true,
      verifyEmail: true,
   },
});
