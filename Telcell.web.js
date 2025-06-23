import { Permissions, webMethod } from "wix-web-module";

const Main_Domain = 'https://digitalbrains.am/api/telcell/pay.php';
export const getTelcellCheckout = webMethod(
    Permissions.Anyone,
    async (accessToken, order, wixTransactionId) => {
        
        const price_total = order.description.totalAmount/100;
        
        const paymentLink = Main_Domain+
            '?action=pay'+
            '&license='+accessToken+
            '&wixTransactionId='+wixTransactionId+
            '&price='+price_total+
            '&return_data=true'+
            '&back_url='+encodeURIComponent(order.returnUrls.successUrl)+
            '&fail_url='+encodeURIComponent(order.returnUrls.errorUrl);
        
        return paymentLink;
        
    }
);
