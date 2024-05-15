// controllers/FilesController.js

import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';

export default class FilesController {
  static async postUpload(req, res) {
    const { name, type, data, parentId = '0', isPublic = false } = req.body;
    const { userId } = req.user;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      const parent = parentId === '0' ? null : await dbClient.files.findOne({ _id: ObjectId(parentId), userId: ObjectId(userId) });
      if (parentId !== '0' && !parent) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentId !== '0' && parent.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }

      const newFile = {
        userId: ObjectId(userId),
        name,
        type,
        parentId: ObjectId(parentId),
        isPublic,
      };

      if (type !== 'folder') {
        // Save file to disk
        // ...
        newFile.localPath = `/tmp/files_manager/${uuid()}`;
      }

      const result = await dbClient.files.insertOne(newFile);
      const { ops } = result;

      return res.status(201).json(ops[0]);
    } catch (error) {
      console.error('Error creating file:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async getShow(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      const file = await dbClient.files.findOne({ _id: ObjectId(id), userId: ObjectId(userId) });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.json(file);
    } catch (error) {
      console.error('Error retrieving file:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async getIndex(req, res) {
    const { parentId = '0', page = 0 } = req.query;
    const { userId } = req.user;

    try {
      const pipeline = [
        { $match: { userId: ObjectId(userId), parentId: ObjectId(parentId) } },
        { $skip: page * 20 },
        { $limit: 20 },
      ];

      const files = await dbClient.files.aggregate(pipeline).toArray();

      return res.json(files);
    } catch (error) {
      console.error('Error retrieving files:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async putPublish(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      const file = await dbClient.files.findOne({ _id: ObjectId(id), userId: ObjectId(userId) });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.files.updateOne({ _id: ObjectId(id) }, { $set: { isPublic: true } });
      const updatedFile = await dbClient.files.findOne({ _id: ObjectId(id) });

      return res.json(updatedFile);
    } catch (error) {
      console.error('Error publishing file:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async putUnpublish(req, res) {
    const { id } = req.params;
    const { userId } = req.user;

    try {
      const file = await dbClient.files.findOne({ _id: ObjectId(id), userId: ObjectId(userId) });
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.files.updateOne({ _id: ObjectId(id) }, { $set: { isPublic: false } });
      const updatedFile = await dbClient.files.findOne({ _id: ObjectId(id) });

      return res.json(updatedFile);
    } catch (error) {
      console.error('Error unpublishing file:', error);
      return res.status(500).json({ error: 'Server error' });
    }
  }
}
