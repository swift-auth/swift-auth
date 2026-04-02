import { SwiftAuth } from 'swift-auth';

export default new SwiftAuth({
   emailAndPassword: {
      enabled: true,
      verifyEmail: true,
   },
});
