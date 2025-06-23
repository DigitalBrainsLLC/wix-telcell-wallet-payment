export function getConfig() {
    return {
        title: "Telcell Wallet Payments",
        paymentMethods: [
            {
                hostedPage: {
                    title: "Telcell Wallet",
                    // Require the city field in the billing address.
                    // billingAddressMandatoryFields: ["CITY"],
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