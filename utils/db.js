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

  async findUser(email) {
    return this.usersCollection.findOne(email);
  }

  async createUser(email, password) {
    const user = {
      email,
      password: sha1(password),
    };
    const result = await this.usersCollection.insertOne(user);
    return result.ops[0];
  }
}

const dbClient = new DBClient();

export default dbClient;
