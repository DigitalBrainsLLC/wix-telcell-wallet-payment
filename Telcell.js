import { getTelcellCheckout } from "backend/Telcell.web";

export const connectAccount = async (options, context) => {
    const { credentials } = options;

    if (!credentials.telcellAccessToken || !credentials.telcellAccessToken.trim()) {
        return {
            accountId: null,
            accountName: null,
            credentials: {},
            reasonCode: 2001,
        };
    }

    return {
        accountId: credentials.telcellAccessToken,
        accountName: "Telcell Wallet",
        credentials,
    };
};

export const createTransaction = async (options, context) => {
    console.log("Processing Telcell Wallet Transaction:", options);
    
    const { merchantCredentials, order, wixTransactionId } = options;
    const accessToken = merchantCredentials.telcellAccessToken;
    // const locationId = merchantCredentials.telcellLocationId;
    // Call our backend module
    const telcellCheckoutUrl = await getTelcellCheckout(accessToken, order, wixTransactionId);
    
    return {
        pluginTransactionId: wixTransactionId,
        redirectUrl: telcellCheckoutUrl,
    };
};

export const refundTransaction = async (options, context) => {
    console.log("Processing Telcell Wallet Refund:", options);
    return {
        pluginTransactionId: options.wixTransactionId,
        reasonCode: 3025,
    };
};