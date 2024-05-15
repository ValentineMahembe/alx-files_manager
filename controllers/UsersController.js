// controllers/UsersController.js
import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Ensure dbClient is properly initialized and connected before accessing methods
      if (!dbClient.isAlive()) {
        return res.status(500).json({ error: 'Database connection error' });
      }

      const user = await dbClient.collection('users').findOne({ email });
      if (user) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = sha1(password);
      const newUser = {
        email,
        password: hashedPassword,
      };

      const result = await dbClient.collection('users').insertOne(newUser);
      const userId = result.insertedId;

      return res.status(201).json({ id: userId, email });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
