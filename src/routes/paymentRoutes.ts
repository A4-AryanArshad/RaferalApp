import express, { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { PaymentService } from '../services/paymentService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/payments/methods
 * Get user payment methods (protected)
 */
router.get('/methods', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const methods = await PaymentService.getUserPaymentMethods(req.user.userId);

    res.json({ methods });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch payment methods' });
  }
});

/**
 * POST /api/payments/methods
 * Save payment method (protected)
 */
router.post(
  '/methods',
  authenticate,
  [
    body('type').isIn(['bank_transfer', 'paypal', 'stripe', 'other']),
    body('details').notEmpty().withMessage('Payment method details are required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { type, details } = req.body;

      const method = await PaymentService.savePaymentMethod(req.user.userId, {
        type,
        details,
      });

      res.status(201).json({
        message: 'Payment method saved successfully',
        method,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to save payment method' });
    }
  }
);

/**
 * POST /api/payments/withdraw
 * Create withdrawal request (protected)
 */
router.post(
  '/withdraw',
  authenticate,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').optional().trim(),
    body('paymentMethod.type').isIn(['bank_transfer', 'paypal', 'stripe', 'other']),
    body('paymentMethod.details').notEmpty().withMessage('Payment method details are required'),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { amount, currency, paymentMethod } = req.body;

      const transaction = await PaymentService.createWithdrawal({
        userId: req.user.userId,
        amount,
        currency,
        paymentMethod,
      });

      res.status(201).json({
        message: 'Withdrawal request created successfully',
        transaction,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create withdrawal' });
    }
  }
);

/**
 * GET /api/payments/transactions
 * Get user transactions (protected)
 */
router.get(
  '/transactions',
  authenticate,
  [
    query('type').optional().isIn(['withdrawal', 'deposit', 'refund']),
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('skip').optional().isInt({ min: 0 }),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const filters: any = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.limit) filters.limit = Number(req.query.limit);
      if (req.query.skip) filters.skip = Number(req.query.skip);

      const transactions = await PaymentService.getUserTransactions(
        req.user.userId,
        filters
      );

      res.json({ transactions });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch transactions' });
    }
  }
);

/**
 * GET /api/payments/transactions/:id
 * Get transaction by ID (protected)
 */
router.get(
  '/transactions/:id',
  authenticate,
  [param('id').isMongoId()],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const transaction = await PaymentService.getTransactionById(req.params.id);

      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      // Verify user owns this transaction
      if (transaction.userId.toString() !== req.user.userId) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json({ transaction });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to fetch transaction' });
    }
  }
);

export default router;




