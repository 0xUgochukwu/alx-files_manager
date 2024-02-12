import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class FilesController {
  static async getShow(request, response) {
    const { id } = request.params;
    const _id = new ObjectId(id);
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const file = await dbClient.findFile(_id);
    if (file && userId) {
      if (userId === file.userId) {
        response.send(file);
      }
    }
  }
}
