import { NextResponse } from "next/server";

export async function GET() {
  const discoveryProfile = {
    ucp: {
      version: "2026-01-11",
      capabilities: [
        "dev.ucp.shopping.checkout",
        "dev.ucp.shopping.fulfillment",
        "dev.ucp.shopping.discount",
        "dev.ucp.shopping.order",
      ],
    },
    business: {
      name: "Ylang Créations",
      domain: "ylang-creations.com",
      urls: {
        privacy_policy: "https://ylang-creations.com/legal/confidentialite",
        terms_of_service: "https://ylang-creations.com/legal/cgv",
        refund_policy: "https://ylang-creations.com/legal/retours",
        shipping_policy: "https://ylang-creations.com/legal/livraison",
      },
    },
    transports: {
      rest: {
        root_url: "https://ylang-creations.com/api/ucp",
      },
    },
  };

  return NextResponse.json(discoveryProfile);
}
