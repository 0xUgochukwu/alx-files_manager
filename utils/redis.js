import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnected = true;
    this.client.on('error', (err) => {
      this.isConnected = false;
      console.error(err);
    });
    this.client.on('connect', () => {
      this.isConnected = true;
    });
    this.getAsync = promisify(this.client.get).bind(this.client);
  }

  isAlive() {
    return this.isConnected;
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
