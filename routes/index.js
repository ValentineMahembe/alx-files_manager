import express from 'express';
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

export default router;
