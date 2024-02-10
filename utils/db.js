import { MongoClient } from "mongodb";

class DBClient {
  constructor() {
    const URL = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}` || 'mongodb://localhost:27017';
    const DB = process.env.DB_DATABASE || 'files_manager';
    const client = new MongoClient(URL);
    client.connect();
    this.dbClient = client.db(DB);
  }

  isAlive() {
    return this.dbClient.isConnected();
  }

  async nbUsers() {
    const users = this.dbClient.collection('users').find();
    return users.length();
  }

  async nbFiles() {
    const files = this.dbClient.collection('files').find();
    return files.length();
  }
}


const dbClient = new DBClient();

export default dbClient;
