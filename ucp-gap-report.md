# UCP Gap Analysis & Robustness Report

## Executive Summary

The project uses a functional Stripe Checkout integration with webhook processing. While it covers the basic requirements for payment processing, it falls short of the Universal Commerce Protocol (UCP) standards and has a critical robustness risk regarding order size.

## Robustness Analysis

### 🔴 Critical Risk: Stripe Metadata Limit (500 chars)

In `lib/actions/checkout.ts`, the cart items are serialized into a JSON string and sent as Stripe metadata. Stripe has a **500-character limit** for metadata.

- **Impact**: Orders with many items or complex configurations will have their `items` metadata truncated.
- **Consequence**: The webhook (`app/api/webhooks/stripe/route.ts`) will fail to parse the items, leading to failed order creation and stock updates for large orders.
- **Recommendation**: Store the "pending" order in the database _before_ redirecting to Stripe, and pass ONLY the `orderId` in the metadata.

### 🟡 Partial: Idempotency

The webhook uses a database transaction and a unique constraint on `stripeSessionId`.

- **Status**: Mostly robust. It prevents duplicate orders if Stripe retries the webhook.
- **Recommendation**: Ensure that email sending and other side effects are also idempotent or handled after the transaction completes successfully.

---

## UCP Compliance Gaps

| Requirement                            | Status      | Finding                                                                                     |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| Discovery Profile (`/.well-known/ucp`) | **MISSING** | No discovery endpoint found.                                                                |
| Response Envelope (`ucp` object)       | **MISSING** | API responses return raw data instead of the UCP-standard envelope.                         |
| Capability Negotiation                 | **MISSING** | No handling of the `UCP-Agent` header for versioning and feature parity.                    |
| Status Lifecycle                       | **PARTIAL** | Basic statuses (`pending`, `paid`) are used, but they don't align with UCP's state machine. |
| Payment Handler Abstraction            | **PARTIAL** | Stripe is integrated directly. UCP recommends wrapping listeners in a standardized handler. |

## Recommendations

1. **Fix Metadata Risk**: Implement a "Pending Order" pattern where cart data is persisted locally before checkout.
2. **UCP Initialization**: Create the `/.well-known/ucp` route to enable automatic discovery by UCP-compliant agents.
3. **Response Standardization**: Wrap checkout API responses in the UCP metadata envelope.
4. **Enhanced Webhook**: Add more granular event handling (e.g., `checkout.session.expired`, `charge.refunded`).
