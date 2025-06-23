---

# Telcell Wallet Payments Integration for Wix Checkout

## Introduction

This project provides a step-by-step guide for integrating **Telcell Wallet Payments** into a **Wix eCommerce site** using **custom backend scripts**, **JWT authentication**, and **Wix Velo developer tools**. It enables a seamless redirection to Telcell Wallet’s secure hosted payment page and updates the transaction status in Wix automatically via webhooks.

> ⚠️ **Disclaimer:**
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
- [Contributors](#contributors)
- [License](#license)

---

## Requirements

- An active **Telcell Wallet account** with webhook capabilities.
- A **Wix account** with an active eCommerce store.
- Basic understanding of JavaScript and Wix Velo (Developer Mode).

---

## Installation

### Step 1: Call And Register Your Company in Telcell Wallet

1. Provide the Company information to **Telcell Wallet**.
2. Get the **API Key** and **API Secret**.
3. Buy license key from **Digital Brains LLC**.

### Step 2: Enable Developer Mode in Wix

1. Log into your Wix Dashboard.
2. Open your site in the Editor.
3. In the top menu, click on **Dev Mode** and enable it.

---

## Configuration

### Step 3: Create Backend Files

- Under **Backend**, create a file called `Telcell.web.js` and add the following:

```javascript
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
```

- Create another backend file to expose your API endpoint:
- in same line Backend click on plus button and add a new file called `Expose site API`
- the file name must be `http-functions.js`

```javascript
import { ok, badRequest } from 'wix-http-functions';
import wixPaymentProviderBackend from "wix-payment-provider-backend";
export async function post_updateTransaction(request) {
  const payload = await request.body.json();
  if (payload.type == "payment_updated" && payload.status == "PAID") {
    await wixPaymentProviderBackend.submitEvent({
      event: {transaction: {wixTransactionId: payload.wixTransactionId,
          pluginTransactionId: payload.order_id}}});return ok();
  }
  return badRequest();
}
```

---

### Step 4: Configure the Payment Plugin

1. Navigate to **Service Plugins** in Dev Mode.
2. Add a new plugin under **Payments** named `Telcell`.

#### Telcell-config.js

```javascript
export function getConfig() {
  return {title: "Telcell Wallet Payments", paymentMethods: [{
        hostedPage: {title: "Telcell Wallet", logos: {white: {
              svg: "https://www.digitalbrains.am/api/wix/telcell_payment/telcell.svg",
              png: "https://www.digitalbrains.am/api/wix/telcell_payment/telcell.png"
            }, colored: {
              svg: "https://www.digitalbrains.am/api/wix/telcell_payment/telcell.png",
              png: "https://www.digitalbrains.am/api/wix/telcell_payment/telcell.png"}
          }}}], credentialsFields: [{
        simpleField: {name: "telcellAccessToken", label: "Telcell Access Token / License"}
      }]};
}
```

#### Telcell.js

```javascript
import { getTelcellCheckout } from "backend/Telcell.web";
export const connectAccount = async (options, context) => {
  const { credentials } = options; return { credentials };
};
export const createTransaction = async (options, context) => {
  const { merchantCredentials, order, wixTransactionId } = options;
  const accessToken = merchantCredentials.telcellAccessToken;
  const telcellCheckoutUrl = await getTelcellCheckout(accessToken, order, wixTransactionId);
  return { pluginTransactionId: wixTransactionId, redirectUrl: telcellCheckoutUrl};
};
export const refundTransaction = async (options, context) => {};
```

### Step 5: Connect Telcell Wallet in Wix

1. Go to **Settings → Accept Payments** in your Wix Dashboard.
2. Select **Telcell Wallet** and click **Connect**.
3. Enter your Token/License, and Button URL.
4. Click **Connect**.

### Step 6: Testing

Go to your website and test the payment flow:

- Check in payment providers list **Telcell Wallet** exist.
- Creating order and redirecting to Telcell Wallet.
- If you see **License Error**, then contact Telcell Wallet support.
- Or buy license from **Digital Brains LLC**.

```
https://www.digitalbrains.am/
```

---

## Usage

- Visitors can now choose **Telcell Wallet** at checkout.
- They are redirected to a secure Telcell Wallet-hosted page.
- Upon completion, the transaction is updated in Wix automatically.

---

## Features

- ✅ Secure Hash/Token generation for transactions
- 🔁 Live-based transaction update
- 🔌 Plugin-based payment integration
- 💼 Merchant credential management
- 🧪 Built-in testing

---

## Code Structure

```
/backend
  └── Telcell.web.js
  └── http-functions.js
/service-plugins/Telcell
  └── Telcell.js
  └── Telcell-config.js
```

---

## Testing

- Run a test transaction (e.g., AMD 1).
- Check if:
  - Payment redirects correctly.
  - Telcell Wallet confirms the payment.
  - Wix receives the transaction update.

---

## Troubleshooting

| Problem                     | Solution                                                           |
|-----------------------------|--------------------------------------------------------------------|
| Payment not updating in Wix | Verify the webhook URL is correctly set in Telcell Wallet.         |
| Token errors                | Ensure License/Token correct and match Telcell Wallet’s account settings. |
| Redirect not working        | Confirm that the Button URL is correctly set in the plugin config. |

---

## Contributors

- [Telcell Wallet](https://www.Telcell.am/)
- [Wix Velo Docs](https://www.wix.com/velo)
- [Digital Brains LLC](https://www.digitalbrains.am/)

---

## License

This integration guide is provided "as-is" with no guarantees. Use at your own risk. For commercial or production use, consult a Wix developer or contact Digital Brains support for assistance.

---

