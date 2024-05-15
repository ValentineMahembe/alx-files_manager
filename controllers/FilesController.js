import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
    async postUpload(req, res) {
        try {
            // Retrieve user based on token
            const userId = req.user.id; // Assuming req.user contains the authenticated user information

            // Validate request body
            const { name, type, parentId = 0, isPublic = false, data } = req.body;
            if (!name) {
                return res.status(400).json({ error: 'Missing name' });
            }
            if (!type || !['folder', 'file', 'image'].includes(type)) {
                return res.status(400).json({ error: 'Missing type or invalid type' });
            }
            if ((type !== 'folder') && !data) {
                return res.status(400).json({ error: 'Missing data' });
            }

            // If parentId is set, validate it
            if (parentId !== 0) {
                const parentFile = await dbClient.files.findOne({ _id: parentId });
                if (!parentFile) {
                    return res.status(400).json({ error: 'Parent not found' });
                }
                if (parentFile.type !== 'folder') {
                    return res.status(400).json({ error: 'Parent is not a folder' });
                }
            }

            // Create new file in DB
            const newFile = {
                userId,
                name,
                type,
                isPublic,
                parentId,
            };
            const insertedFile = await dbClient.files.insertOne(newFile);
            const fileId = insertedFile.insertedId;

            // Create new file on disk if type is file or image
            if (['file', 'image'].includes(type)) {
                // Determine file storage path
                const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
                const filePath = path.join(folderPath, uuidv4());

                // Save file content to disk
                const fileBuffer = Buffer.from(data, 'base64');
                fs.writeFileSync(filePath, fileBuffer);

                // Update file document with local path
                await dbClient.files.updateOne({ _id: fileId }, { $set: { localPath: filePath } });
            }

            // Return response
            return res.status(201).json({
                id: fileId,
                userId,
                name,
                type,
                isPublic,
                parentId,
            });
        } catch (error) {
            console.error('Error creating file:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default new FilesController();
