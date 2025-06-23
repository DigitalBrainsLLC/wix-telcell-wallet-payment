import { ok, badRequest } from 'wix-http-functions';
import wixPaymentProviderBackend from "wix-payment-provider-backend";

export function get_multiply(request) {
    
    const response = {
        "headers": {
            "Content-Type": "application/json"
        }
    }
    
    try {
        const leftOperand = parseInt(request.query["leftOperand"], 10);
        const rightOperand = parseInt(request.query["rightOperand"], 10);
        
        response.body = {
            "product": leftOperand * rightOperand
        }
        return ok(response);
        
    } catch (err) {
        response.body = {
            "error": err
        }
        return badRequest(response);
    }
}

export async function post_updateTransaction(request) {
    const payload = await request.body.json();
    // return payload;
    console.log("Received Telcell Wallet Webhook:", payload);
    
    if (payload.type == "payment_updated" && payload.status == "PAID") {
        await wixPaymentProviderBackend.submitEvent({
            event: {
                transaction: {
                    wixTransactionId: payload.wixTransactionId,
                    pluginTransactionId: payload.order_id,
                }
            }
        });
        return ok();
    }
    
    return badRequest();
}