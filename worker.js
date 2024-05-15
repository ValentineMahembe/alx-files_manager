// worker.js
const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const { findFileById } = require('./controllers/FilesController'); // Import function to find file by id

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
    try {
        // Check if fileId and userId are present in the job
        if (!job.data.fileId) {
            throw new Error('Missing fileId');
        }
        if (!job.data.userId) {
            throw new Error('Missing userId');
        }
        
        // Find file in DB
        const file = await findFileById(job.data.fileId, job.data.userId);
        if (!file) {
            throw new Error('File not found');
        }
        
        // Generate thumbnails
        const thumbnails = await Promise.all([
            imageThumbnail(file.localPath, { width: 500 }),
            imageThumbnail(file.localPath, { width: 250 }),
            imageThumbnail(file.localPath, { width: 100 })
        ]);

        // Store thumbnails with original file
        // Your code to store thumbnails with original file
    } catch (error) {
        throw error;
    }
});
