import sha1 from 'sha1';
import { v4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export default class AuthController {
  static async getConnect(request, response) {
    const Auth = request.headers.authorization.split(' ');
    if (Auth.length === 2 && Auth[0] === 'Basic') {
      const userCredential = Auth[1];
      const base64Decode = Buffer.from(userCredential, 'base64').toString('binary');
      const sepPos = base64Decode.indexOf(':');
      const email = base64Decode.substring(0, sepPos);
      const password = sha1(base64Decode.substring(sepPos + 1));
      const user = await dbClient.findUser({ email });

      if (user) {
        if (password === user.password) {
          const token = v4();
          const key = `auth_${token}`;
          await redisClient.set(key, user._id.toString(), (24 * 60 * 60));
          return response.status(200).send({ token });
        }
        return response.status(401).send({ error: 'Unauthorized' });
      }
    }
    return response.status(401).send({ error: 'Unauthorized' });
  }

  static async getDisconnect(request, response) {
    const token = request.headers['x-token'];
    await redisClient.del(`auth_${token}`);
    return response.status(204).send();
  }
}
