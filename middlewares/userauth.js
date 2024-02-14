import { ObjectId } from 'mongodb';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function getUser(request, response, next) {
  const token = request.headers['x-token'];
  const id = await redisClient.get(`auth_${token}`);
  if (id) {
    const _id = new ObjectId(id);
    const user = await dbClient.findUser(_id);
    if (user) {
      request.user = user;
      return next();
    }
    request.user = '';
  }
  return response.status(404).send({ error: 'Not found' });
}

export default getUser;
