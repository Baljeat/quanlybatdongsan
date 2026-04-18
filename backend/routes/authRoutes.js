const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.verifyToken, authController.logout);
router.get('/me', authController.verifyToken, authController.me);

module.exports = router;
