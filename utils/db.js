import { MongoClient } from 'mongodb';
import sha1 from 'sha1';

const HOST = process.env.DB_HOST || 'localhost';
const PORT = process.env.DB_PORT || '27017';
const URL = `mongodb://${HOST}:${PORT}`;
const DB = process.env.DB_DATABASE || 'files_manager';

class DBClient {
  constructor() {
    MongoClient.connect(URL, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.error(err);
        this.db = false;
      } else {
        this.db = client.db(DB);
        this.usersCollection = this.db.collection('users');
        this.filesCollection = this.db.collection('files');
      }
    });
  }

  isAlive() {
    return Boolean(this.db);
  }

  async nbUsers() {
    return this.usersCollection.countDocuments();
  }

  async nbFiles() {
    return this.filesCollection.countDocuments();
  }

  async findUser(query) {
    return this.usersCollection.findOne(query);
  }

  async findFile(query) {
    return this.filesCollection.findOne(query);
  }

  async findFiles(query, skip, limit) {
    const piplines = [{ $match: query }, { $skip: skip }, { $limit: limit }];
    return this.filesCollection.aggregate(piplines).toArray();
  }

  async createUser(email, password) {
    const user = {
      email,
      password: sha1(password),
    };
    const result = await this.usersCollection.insertOne(user);
    return result.ops[0];
  }

  async createFile(data) {
    const result = await this.filesCollection.insertOne(data);
    return result.ops[0];
  }

  async updateUser(query, newFields) {
    return this.usersCollection.updateOne(query, { $set: newFields });
  }

  async updateFile(query, newFields) {
    return this.filesCollection.updateOne(query, { $set: newFields });
  }
}

const dbClient = new DBClient();

export default dbClient;
