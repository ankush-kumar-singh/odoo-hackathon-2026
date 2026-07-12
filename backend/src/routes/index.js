import express from 'express';

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'TransitOps API is ready.' });
});

export default router;
