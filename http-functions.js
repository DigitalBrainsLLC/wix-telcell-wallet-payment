import { ok, badRequest } from 'wix-http-functions';
import wixPaymentProviderBackend from "wix-payment-provider-backend";

export async function post_updateTransaction(request) {
    const payload = await request.body.json();
    console.log("Received Telcell Wallet Webhook:", payload);

    if (!payload.wixTransactionId || !payload.type || !payload.status) {
        console.error("Webhook payload missing required fields:", payload);
        return badRequest({ body: { error: "Missing required fields" } });
    }

    if (payload.type === "payment_updated" && payload.status === "PAID") {
        // TODO: Add webhook authentication before processing payments.
        // Either verify a signature header (e.g., X-Telcell-Signature via HMAC-SHA256)
        // or re-query the Digital Brains API to confirm payment status independently.
        // Without this, forged PAID events could mark transactions as complete.

        await wixPaymentProviderBackend.submitEvent({
            event: {
                transaction: {
                    wixTransactionId: payload.wixTransactionId,
                    pluginTransactionId: payload.wixTransactionId,
                    reasonCode: 3000,
                }
            }
        });
        return ok({ body: { success: true } });
    }

    return badRequest({ body: { error: "Unhandled event type or status" } });
}
