import { Router } from 'express';
import Message from '../models/message.model.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const messages = await Message.find().lean();
        res.render('chat', { messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Error fetching messages');
    }
});

export default router;
