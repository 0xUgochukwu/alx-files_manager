import { ObjectId } from 'mongodb';
import { v4 } from 'uuid';
import fs from 'fs';
import mime from 'mime-types';
import dbClient from '../utils/db';
import { getUser } from '../middlewares/auth';

const VALID_TYPES = ['folder', 'file', 'image'];
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
const ObjectIdRegex = /^[0-9a-fA-F]{24}$/;
const fileExists = async (path) => {
  try {
    await fs.promises.access(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') { return false; }
    throw error;
  }
};

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
    if (!ObjectIdRegex.test(id)) { return response.status(404).json({ error: 'Not found' }); }
    const _id = new ObjectId(id);
    const file = await dbClient.findFile(_id);
    if (!file) { return response.status(404).json({ error: 'Not found' }); }
    if (request.user._id.toString() === file.userId.toString()) {
      const fileData = {
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      };
      return response.status(200).json(fileData);
    }
    return response.status(404).json({ error: 'Not found' });
  }

  static async getIndex(request, response) {
    let parentId = request.query.parentId || 0;
    parentId = /^\d$/.test(parentId) ? Number(parentId) : parentId;
    const page = Number(request.query.page) || 0;
    const limit = Number(request.query.limit) || 20;
    const userId = request.user._id;
    const skip = (page) * limit;

    if (!request.user) { return response.status(401).json({ error: 'Unauthorized' }); }
    const query = parentId === 0 ? { userId } : { userId, parentId };

    const temp = await dbClient.findFiles(query, skip, limit);
    const files = [];
    if (temp) {
      temp.forEach((doc) => {
        const file = {
          id: doc._id.toString(),
          userId: doc.userId,
          name: doc.name,
          type: doc.type,
          isPublic: doc.isPublic,
          parentId: doc.parentId,
        };
        files.push(file);
      });
    }
    return response.status(200).json(files);
  }

  static async getFile(request, response) {
    const { id } = request.params;
    if (!ObjectIdRegex.test(id)) { return response.status(404).json({ error: 'Not found' }); }
    const _id = new ObjectId(id);
    const file = await dbClient.findFile(_id);
    if (file) {
      if (!file.isPublic && !(await getUser(request, response))) {
        return response.status(404).send({ error: 'Not found' });
      }
      const userId = request.user ? request.user._id.toString() : '';
      if (!file || (!file.isPublic && file.userId.toString() !== userId)) {
        return response.status(404).json({ error: 'Not found' });
      } if (file.type === 'folder') {
        return response.status(400).json({ error: "A folder doesn't have content" });
      }
      const path = file.localPath;
      if (path) {
        if (!(await fileExists(path))) {
          return response.status(404).json({ error: 'Not found' });
        }
      }
      const mineType = mime.lookup(file.name);
      response.setHeader('Content-Type', mineType || 'text/plain; charset=utf-8');
      let data;
      try {
        data = await fs.promises.readFile(path);
      } catch (error) {
        return response.status(404).json({ error: 'Not found' });
      }
      return response.status(200).send(data);
    }
    return response.status(404).json({ error: 'Not found' });
  }

  static async putPublish(request, response) {
    const _id = new ObjectId(request.params.id);
    const file = await dbClient.findFile(_id);

    if (!file || request.user._id.toString() !== file.userId.toString()) {
      return response.status(404).send({ error: 'Not found' });
    }

    await dbClient.updateFile({ _id }, { isPublic: true });

    return response.status(200).send({
      id: file._id.toString(),
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: true,
      parentId: file.parentId,
    });
  }

  static async putUnpublish(request, response) {
    const _id = new ObjectId(request.params.id);
    const file = await dbClient.findFile(_id);

    if (!file || request.user._id.toString() !== file.userId.toString()) {
      return response.status(404).send({ error: 'Not found' });
    }

    await dbClient.updateFile({ _id }, { isPublic: false });

    return response.status(200).send({
      id: file._id.toString(),
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: false,
      parentId: file.parentId,
    });
  }
}
