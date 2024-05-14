import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';

const UsersController = {
  postNew: async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const existingUser = await dbClient.getUser(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = {
      email,
      password: hashedPassword,
    };

    const result = await dbClient.createUser(newUser);

    return res.status(201).json({ id: result.insertedId, email: newUser.email });
  },
};

export default UsersController;
