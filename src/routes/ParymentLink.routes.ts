import { Router } from 'express';
import { PaymentLinkController } from '../controllers/PaymentLink.controller';

const router = Router();
const paymentLinkController = new PaymentLinkController();

router.post('/', paymentLinkController.createPaymentLink.bind(paymentLinkController));
router.get('/:id', paymentLinkController.getPaymentLinkById.bind(paymentLinkController));
router.put('/:id', paymentLinkController.updatePaymentLink.bind(paymentLinkController));
router.delete('/:id', paymentLinkController.deletePaymentLink.bind(paymentLinkController));

export default router;
