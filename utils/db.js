import { MongoClient } from "mongodb";

const URL =
  `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}` ||
  "mongodb://localhost:27017";
const DB = process.env.DB_DATABASE || "files_manager";

class DBClient {
  constructor() {
    MongoClient.connect(URL, { useUnifiedTopology: true }, (err, client) => {
      if (err) {
        console.error(err);
        this.db = false;
      } else {
        this.db = client.db(DB);
        this.usersCollection = this.db.collection("users");
        this.filesCollection = this.db.collection("files");
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
}

const dbClient = new DBClient();

export default dbClient;
