import { Router, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { PaymentLink } from '../entities/PaymentLink';
import { PaymentLinkService } from '@src/services/PaymentLink.services';

const router = Router();

const paymentLinkService = new PaymentLinkService(getRepository(PaymentLink));

router.post('/', async (req: Request, res: Response) => {
    try {
        const paymentLink = await paymentLinkService.createPaymentLink(req.body);
        res.status(201).json(paymentLink);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
});

router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const paymentLink = await paymentLinkService.getPaymentLinkById(req.params.id);
        if (!paymentLink) return res.status(404).json({ message: 'PaymentLink not found' });
        res.json(paymentLink);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

router.put('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const updatedPaymentLink = await paymentLinkService.updatePaymentLink(req.params.id, req.body);
        if (!updatedPaymentLink) return res.status(404).json({ message: 'PaymentLink not found' });
        res.json(updatedPaymentLink);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
});


// Delete Payment Link
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const success = await paymentLinkService.deletePaymentLink(req.params.id);
        if (!success) return res.status(404).json({ message: 'PaymentLink not found' });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
});

export default router;