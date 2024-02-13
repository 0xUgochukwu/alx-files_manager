import { ObjectId } from 'mongodb';
import { v4 } from 'uuid';
import fs from 'fs';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const VALID_TYPES = ['folder', 'file', 'image'];
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

export default class FilesController {
  static async postUpload(request, response) {
    const { name, type, parentId, isPublic, data } = request.body;
    if (!name) {
      return response.status(400).send({ error: 'Missing name' });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return response.status(400).send({ error: 'Missing type' });
    }
    if (!data && type != 'folder') {
      return response.status(400).send({ error: 'Missing data' });
    }
    if (parentId) {
      const parent = await dbClient.findFile({ _id: parentId });
      if (!parent) {
        return response.status(400).send({ error: 'Parent not found' });
      }
      if (parent.type !== 'folder') {
        return response.status(400).send({ error: 'Parent is not a folder' });
      }
    }
    const userId = request.user._id;
    let newFile = {
      userId,
      name,
      type,
      isPublic: isPublic || false,
      parentId: parentId || 0,
    };

    if (type === 'folder') {
      newFile = await dbClient.createFile(newFile);
    } else {
      const localPath = `${FOLDER_PATH}/${v4()}`;
      const buffer = Buffer.from(data, 'base64');
      fs.writeFileSync(localPath, buffer);
      newFile = await dbClient.createFile({ ...newFile, localPath });
    }

    return response.status(201).send(newFile);
  }

  static async getShow(request, response) {
    const { id } = request.params;
    const _id = new ObjectId(id);
    const token = request.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    const file = await dbClient.findFile(_id);
    if (file && userId) {
      const ID = new ObjectId(userId);
      const user = await dbClient.findUser(ID);
      if (!user) {
        response.status(401).json({ error: 'Unauthorized' });
      } else if (userId === file.userId) {
        response.status(200).json(file);
      } else {
        response.status(404).json({ error: 'Not found' });
      }
    }
  }
}
