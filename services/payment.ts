
import { BankConfig } from '../types';

export const PaymentService = {
    // Generate VietQR URL for dynamic QR code image
    // Using quickchart.io or img.vietqr.io API
    generateVietQRUrl: (bankConfig: BankConfig, amount: number, content: string): string => {
        // VietQR Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>&accountName=<NAME>
        
        const bankId = bankConfig.bankId || 'MB';
        const accountNo = bankConfig.accountNo;
        const template = bankConfig.template || 'compact';
        const accountName = encodeURIComponent(bankConfig.accountName || '');
        const addInfo = encodeURIComponent(content);
        
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
    },

    // Mock function to check transaction status from Bank API
    checkTransactionStatus: async (orderId: string): Promise<boolean> => {
        // In a real app, this would call your backend which queries the Bank/Payment Gateway
        // Here we simulate a check delay and random success
        await new Promise(resolve => setTimeout(resolve, 2000));
        return true; 
    }
};
