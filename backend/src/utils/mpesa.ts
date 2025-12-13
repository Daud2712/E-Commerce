// Payment integration removed
import axios from 'axios';
import moment from 'moment';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE; // Your Paybill/Till Number
const PASSKEY = process.env.MPESA_PASSKEY; // Provided by Safaricom for LNM Online
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL; // Your public URL for callbacks
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'; // 'sandbox' or 'production'

if (!CONSUMER_KEY || !CONSUMER_SECRET || !SHORTCODE || !PASSKEY || !CALLBACK_URL) {
  console.error('M-Pesa environment variables are not fully configured.');
  // In a real application, you might want to throw an error or handle this more gracefully
}

// Function to generate M-Pesa access token
export const generateAccessToken = async (): Promise<string> => {
    try {
        if (!CONSUMER_KEY || !CONSUMER_SECRET) {
            throw new Error('MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET is not defined.');
        }
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
        const url = MPESA_ENV === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });
        return response.data.access_token;
    } catch (error: any) {
        console.error('Error generating M-Pesa access token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to generate M-Pesa access token.');
    }
};

// Function to initiate STK Push
export const initiateSTKPush = async (
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string
): Promise<any> => {
    try {
        if (!SHORTCODE || !PASSKEY || !CALLBACK_URL) {
            throw new Error('M-Pesa STK Push required environment variables are not defined.');
        }

        const accessToken = await generateAccessToken();
        const timestamp = moment().format('YYYYMMDDHHmmss');
        const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

        const url = MPESA_ENV === 'sandbox'
            ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

        const payload = {
            BusinessShortCode: SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline', // Assuming Paybill. Change to CustomerBuyGoodsOnline for Till Numbers
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: SHORTCODE,
            PhoneNumber: phoneNumber,
            CallBackURL: CALLBACK_URL,
            AccountReference: accountReference, // e.g., Order ID, Delivery ID
            TransactionDesc: transactionDesc // e.g., Payment for Delivery #XYZ
        };

        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data; // Contains CheckoutRequestID, MerchantRequestID, ResponseCode etc.
    } catch (error: any) {
        console.error('Error initiating M-Pesa STK Push:', error.response ? error.response.data : error.message);
        throw new Error('Failed to initiate M-Pesa STK Push.');
    }
};
