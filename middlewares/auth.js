import { ObjectId } from 'mongodb';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

async function getUserFromToken(request, response, next) {
  const token = request.headers['x-token'];
  const id = await redisClient.get(`auth_${token}`);
  if (id) {
    const _id = new ObjectId(id);
    const user = await dbClient.findUser(_id);
    if (user) {
      request.user = user;
      next();
    } else {
      return response.status(401).send({ error: 'Unauthorized' })
    };
  } else {
    return response.status(401).send({ error: 'Unauthorized' })
  };
}

export default getUserFromToken;
