import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UsersController {
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      return response.status(400).send({ error: 'Missing email' });
    }
    if (!password) {
      return response.status(400).send({ error: 'Missing password' });
    }

    let user = await dbClient.findUser({ email });
    if (user) {
      return response.status(400).send({ error: 'Already exist' });
    }

    user = await dbClient.createUser(email, password);
    return response.status(201).send({ email: user.email, id: user._id.toString() });
  }

  static async getMe(request, response) {
    const token = request.headers['x-token'];
    const id = await redisClient.get(`auth_${token}`);
    if (id !== null) {
      const _id = new ObjectId(id);
      const user = await dbClient.findUser(_id);
      if (user) {
        response.status(200).send({ email: user.email, id: user._id.toString() });
      } else {
        response.status(401).send({ error: 'Unauthorized' });
      }
    } else {
      response.status(401).send({ error: 'Unauthorized' });
    }
  }
}
