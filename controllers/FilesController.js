import { ObjectId } from 'mongodb';
import { v4 } from 'uuid';
import fs from 'fs';

import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const VALID_TYPES = ['folder', 'file', 'image'];
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

if (!fs.existsSync(FOLDER_PATH)) {
  fs.mkdirSync(FOLDER_PATH);
}

export default class FilesController {
  static async postUpload(request, response) {
    const {
      name, type, parentId, isPublic, data,
    } = request.body;
    if (!name) {
      return response.status(400).send({ error: 'Missing name' });
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return response.status(400).send({ error: 'Missing type' });
    }
    if (!data && type !== 'folder') {
      return response.status(400).send({ error: 'Missing data' });
    }
    if (parentId) {
      const parent = await dbClient.findFile({ _id: new ObjectId(parentId) });
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

    return response.status(201).send({
      id: newFile._id.toString(),
      userId: newFile.userId,
      name: newFile.name,
      type: newFile.type,
      isPublic: newFile.isPublic,
      parentId: newFile.parentId,
    });
  }

  static async getShow(request, response) {
    const { id } = request.params;
    const _id = new ObjectId(id);
    const file = await dbClient.findFile(_id);
    if (request.user._id === file.userId) {
      response.status(200).json(file);
    } else {
      response.status(404).json({ error: 'Not found' });
    }
  }

  static async putPublish(request, response) {
    const { id } = request.params;



  }
}
