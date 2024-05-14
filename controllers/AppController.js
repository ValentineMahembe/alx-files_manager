import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const AppController = {
  getStatus: async (req, res) => {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    res.status(200).json({ redis: redisAlive, db: dbAlive });
  },

  getStats: async (req, res) => {
    const nbUsers = await dbClient.nbUsers();
    const nbFiles = await dbClient.nbFiles();

    res.status(200).json({ users: nbUsers, files: nbFiles });
  },
};

export default AppController;
