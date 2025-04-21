import { Request, Response, NextFunction } from 'express';
import { notificationService } from '../core/notification.service';
const NotificationService = notificationService();

export const storeWebhook = async (req:Request, res:Response, next: NextFunction): Promise<void> => {
    const { url, method } = req.body;

    if (!url || !method) {
        res.status(400).json({ error: 'url and method are required' });
        next();
        return;
    }

    try {
        const notificationService = await NotificationService;
        await notificationService.storeWebhook({ url, method });
        res.status(200).json({ url, method });
    } catch (error) {
        console.error('Error storing webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    next();
}

