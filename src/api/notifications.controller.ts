import { Request, Response, NextFunction } from 'express';
import NotificationServiceFactory, {NotificationService} from '../core/notification/notification.service';

export const storeWebhook = async (req:Request, res:Response, next: NextFunction): Promise<void> => {
    const { url, method } = req.body;

    if (!url || !method) {
        res.status(400).json({ error: 'url and method are required' });
        next();
        return;
    }

    try {
        const notificationService: NotificationService = await NotificationServiceFactory();
        await notificationService.storeWebhook({ url });
        res.status(200).json({ url });
    } catch (error) {
        console.error('Error storing webhook:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
    next();
}

