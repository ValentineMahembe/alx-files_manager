import express from 'express';
import { Router } from 'express'
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import AppController from '../controllers/AppController';
import FilesController from '../controllers/FilesController';

const router = express.Router();

// Authentication routes
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);

// User routes
router.get('/users/me', UsersController.getMe);

// First routes
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);

// Files routes
router.post('/files', FilesController.postUpload);
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);

export default router;
