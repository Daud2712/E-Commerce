import { Router, Request, Response, NextFunction } from 'express';
import { initiateSTKPush } from '../utils/mpesa';
import { auth } from '../middleware/auth'; // Assuming 'auth' middleware is available
import Delivery from '../models/Delivery'; // Assuming Delivery model is available
import User from '../models/User'; // Assuming User model is available
import { UserRole } from '../types'; // Assuming IDelivery interface is available

const router = Router();

// Middleware to extend Request with user property
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// @route   POST /api/payments/mpesa/process
// @desc    Initiate M-Pesa STK Push for a delivery
// @access  Private (Buyer only)
router.post('/mpesa/process', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { deliveryId, phoneNumber } = req.body;

    if (!deliveryId || !phoneNumber) {
      return res.status(400).json({ message: 'Delivery ID and phone number are required.' });
    }

    const delivery = await Delivery.findById(deliveryId);

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found.' });
    }

    // Ensure only the buyer of the delivery can pay
    if (delivery.buyer.toString() !== req.user?.id) {
        return res.status(403).json({ message: 'Not authorized to pay for this delivery.' });
    }

    // Ensure delivery is not already paid or in a status that cannot be paid for
    if (delivery.status === 'received' || delivery.status === 'delivered') { // Assuming 'received' or 'delivered' means payment settled
        return res.status(400).json({ message: 'Delivery has already been completed or paid.' });
    }

    const amount = delivery.price; // Get amount from delivery
    const accountReference = delivery._id.toString(); // Use delivery ID as account reference
    const transactionDesc = `Payment for Delivery ${delivery.trackingNumber}`;

    // Initiate STK Push
    const stkPushResponse = await initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc);

    // Save CheckoutRequestID to the delivery for later reference in callback
    delivery.mpesaCheckoutRequestId = stkPushResponse.CheckoutRequestID;
    await delivery.save();

    res.json({
      message: 'STK Push initiated successfully.',
      checkoutRequestID: stkPushResponse.CheckoutRequestID,
      merchantRequestID: stkPushResponse.MerchantRequestID,
      responseCode: stkPushResponse.ResponseCode,
      customerMessage: stkPushResponse.CustomerMessage,
    });

  } catch (error: any) {
    console.error('Error in /mpesa/process:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/payments/mpesa/callback
// @desc    M-Pesa STK Push Callback URL
// @access  Public (M-Pesa servers)
router.post('/mpesa/callback', async (req: Request, res: Response) => {
    console.log('----------- M-Pesa STK Push Callback Received -----------');
    console.log(JSON.stringify(req.body, null, 2));

    try {
        const callbackData = req.body;
        const { Body: { stkCallback: { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } } } = callbackData;

        // Find the delivery associated with this CheckoutRequestID
        const delivery = await Delivery.findOne({ mpesaCheckoutRequestId: CheckoutRequestID });

        if (!delivery) {
            console.error(`Delivery not found for CheckoutRequestID: ${CheckoutRequestID}`);
            return res.json({ "ResultCode": 1, "ResultDesc": "Delivery not found in our system." });
        }

        if (ResultCode === 0) {
            // Payment successful
            const amount = CallbackMetadata.Item.find((item: any) => item.Name === 'Amount')?.Value;
            const mpesaReceiptNumber = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
            const transactionDate = CallbackMetadata.Item.find((item: any) => item.Name === 'TransactionDate')?.Value;
            const phoneNumber = CallbackMetadata.Item.find((item: any) => item.Name === 'PhoneNumber')?.Value;

            console.log(`Payment successful for CheckoutRequestID: ${CheckoutRequestID}`);
            console.log(`Amount: ${amount}, Receipt: ${mpesaReceiptNumber}, Phone: ${phoneNumber}`);

            // Update delivery status and save M-Pesa details
            delivery.status = 'paid'; // Or a more specific 'payment_confirmed' status
            delivery.mpesaReceiptNumber = mpesaReceiptNumber;
            delivery.paidAt = new Date(transactionDate); // Convert timestamp to Date object
            await delivery.save();

            // TODO: Potentially notify seller/rider if needed

        } else {
            // Payment failed or cancelled
            console.log(`Payment failed for CheckoutRequestID: ${CheckoutRequestID}`);
            console.log(`Result Code: ${ResultCode}, Description: ${ResultDesc}`);

            // Update delivery status to reflect failed/cancelled payment
            delivery.status = 'payment_failed'; // Or simply leave as original status
            await delivery.save();
        }

        // Always respond with a 0 ResultCode to M-Pesa to acknowledge receipt
        res.json({ "ResultCode": 0, "ResultDesc": "Callback received successfully" });

    } catch (error: any) {
        console.error('Error in /mpesa/callback:', error.message);
        // Respond with a non-zero ResultCode if your internal processing failed
        res.json({ "ResultCode": 1, "ResultDesc": `Internal server error: ${error.message}` });
    }
});

export default router;
