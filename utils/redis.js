import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnect = true
    this.client.on('error', (err) => {
      this.isConnect = false
      console.error(err);
    });
    this.client.on('connect', () => {
       this.isConnect = true;
    });
    this.getAsync = promisify(this.client.get).bind(this.client);
  }

  isAlive() {
    return this.isConnect;
  }

  async get(key) {
    const value = this.getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  async del(key) {
    this.client.del(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
