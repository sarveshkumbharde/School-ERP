const express = require('express');
const { login, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { loginSchema } = require('../validators/auth.validator');

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
