const express = require('express');
const router = express.Router();
router.post('/admin/login', (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/table/login', (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.get('/auth/verify', (req, res) => res.status(501).json({ error: 'Not implemented' }));
module.exports = router;
