---

# Telcell Wallet Payments Integration for Wix Checkout

## Introduction

This project provides a step-by-step guide for integrating **Telcell Wallet Payments** into a **Wix eCommerce site** using **Wix Velo developer tools** and **custom backend scripts**. It enables a seamless redirection to Telcell Wallet's secure hosted payment page and updates the transaction status in Wix automatically via webhooks.

> **Disclaimer:**
> Make sure to **back up your site** and test thoroughly before enabling this integration in a live environment. This guide assumes intermediate knowledge of Wix Velo and basic web development concepts.

---

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Features](#features)
- [Code Structure](#code-structure)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [References](#references)
- [License](#license)

---

## Requirements

- An active **Telcell Wallet account** with webhook capabilities.
- A **Wix account** with an active eCommerce store.
- A **license key** from **Digital Brains LLC**.
- Basic understanding of JavaScript and Wix Velo (Developer Mode).

---

## Installation

### Step 1: Register Your Company with Telcell Wallet

1. Provide your company information to **Telcell Wallet**.
2. Purchase a license key from **Digital Brains LLC** at [digitalbrains.am](https://www.digitalbrains.am/).

### Step 2: Enable Developer Mode in Wix

1. Log into your Wix Dashboard.
2. Open your site in the Editor.
3. In the top menu, click on **Dev Mode** and enable it.

---

## Configuration

### Step 3: Create Backend Files

Under **Backend**, create a file called `Telcell.web.js` and add the following:

```javascript
import { Permissions, webMethod } from "wix-web-module";

const Main_Domain = 'https://digitalbrains.am/api/telcell/pay.php';
export const getTelcellCheckout = webMethod(
    Permissions.Anyone,
    async (accessToken, order, wixTransactionId) => {
        const price_total = order.description.totalAmount / 100;

        const paymentLink = Main_Domain +
            '?action=pay' +
            '&license=' + encodeURIComponent(accessToken) +
            '&wixTransactionId=' + encodeURIComponent(wixTransactionId) +
            '&price=' + encodeURIComponent(price_total) +
            '&return_data=true' +
            '&back_url=' + encodeURIComponent(order.returnUrls.successUrl) +
            '&fail_url=' + encodeURIComponent(order.returnUrls.errorUrl);

        return paymentLink;
    }
);
```

Next, create the webhook endpoint. In the Backend section, click the **+** button and select **Expose Site API**. This creates a file called `http-functions.js`. Add the following:

```javascript
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
```

---

### Step 4: Configure the Payment Plugin

1. Navigate to **Service Plugins** in Dev Mode.
2. Add a new plugin under **Payments** named `Telcell`.

#### Telcell-config.js

```javascript
export function getConfig() {
    return {
        title: "Telcell Wallet Payments",
        paymentMethods: [
            {
                hostedPage: {
                    title: "Telcell Wallet",
                    logos: {
                        white: {
                            svg: "https://www.digitalbrains.am/api/wix/telcell_payment/telcell.svg",
                            png: "https://www.digitalbrains.am/api/wix/telcell_payment/telcell.png"
                        },
                        colored: {
                            svg: "https://www.digitalbrains.am/api/wix/telcell_payment/telcell.svg",
                            png: "https://www.digitalbrains.am/api/wix/telcell_payment/telcell.png"
                        }
                    }
                }
            }
        ],
        credentialsFields: [
            {
                simpleField: {
                    name: "telcellAccessToken",
                    label: "Telcell Access Domain Token"
                }
            }
        ]
    };
}
```

#### Telcell.js

```javascript
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
    const { merchantCredentials, order, wixTransactionId } = options;
    const accessToken = merchantCredentials.telcellAccessToken;
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
```

### Step 5: Connect Telcell Wallet in Wix

1. Go to **Settings > Accept Payments** in your Wix Dashboard.
2. Select **Telcell Wallet** and click **Connect**.
3. Enter your **Telcell Access Domain Token** (the license key from Digital Brains).
4. Click **Connect**.

### Step 6: Testing

Go to your website and test the payment flow:

- Verify that **Telcell Wallet** appears in the payment providers list.
- Create an order and confirm it redirects to Telcell Wallet.
- If you see a **License Error**, verify your license key or contact [Digital Brains LLC](https://www.digitalbrains.am/) for support.

---

## Usage

- Visitors can now choose **Telcell Wallet** at checkout.
- They are redirected to a secure Telcell Wallet-hosted payment page.
- Upon completion, the transaction status is updated in Wix automatically via webhook.

---

## Features

- Hosted payment page — customers pay on Telcell's secure page
- Automatic transaction updates via webhook
- Plugin-based payment integration for Wix eCommerce
- Merchant credential management (single license key)

---

## Code Structure

```
/backend
  └── Telcell.web.js          # Constructs the Telcell payment redirect URL
  └── http-functions.js       # Webhook endpoint for payment status updates
/service-plugins/Telcell
  └── Telcell.js              # Payment plugin: connect, create, refund
  └── Telcell-config.js       # Plugin metadata, logos, credential fields
/public
  └── telcell.svg             # Brand logo (SVG)
  └── telcell.png             # Brand logo (PNG)
```

---

## Testing

- Run a test transaction (e.g., AMD 1).
- Check if:
  - Payment redirects correctly to Telcell Wallet.
  - Telcell Wallet confirms the payment.
  - Wix receives the transaction update via webhook.

---

## Troubleshooting

| Problem                     | Solution                                                                 |
|-----------------------------|--------------------------------------------------------------------------|
| Payment not updating in Wix | Verify the webhook URL is correctly set in Telcell Wallet settings.      |
| Token/License errors        | Ensure the license key is correct and matches your Digital Brains account.|
| Redirect not working        | Check that `successUrl` and `errorUrl` are being passed correctly.       |
| Invalid credentials error   | Re-enter the Telcell Access Domain Token in Wix payment settings.        |

---

## References

- [Telcell Wallet](https://www.telcell.am/)
- [Wix Velo Documentation](https://www.wix.com/velo)
- [Digital Brains LLC](https://www.digitalbrains.am/)

---

## License

This integration guide is provided "as-is" with no guarantees. Use at your own risk. For commercial or production use, consult a Wix developer or contact Digital Brains support for assistance.

---
