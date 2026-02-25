const express = require('express');
const router = express.Router();
router.post('/admin/tables', (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.get('/admin/tables', (req, res) => res.status(501).json({ error: 'Not implemented' }));
router.post('/admin/tables/:id/complete', (req, res) => res.status(501).json({ error: 'Not implemented' }));
module.exports = router;
