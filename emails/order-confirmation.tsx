import * as React from "react";
import {
  APP_URL,
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailSectionTitle,
  emailTheme as t,
} from "./layout";

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    configuration: {
      fabricName: string;
      embroidery?: string;
      embroideryFont?: string;
      embroideryColor?: string;
      embroideryColorName?: string;
    };
  }>;
  total: number;
  shipping: number;
  shippingAddress?: {
    address: string;
    addressComplement?: string;
    postalCode: string;
    city: string;
    country: string;
  };
}

const NEXT_STEPS = [
  { title: "Confirmation", text: "Votre commande est confirmée" },
  {
    title: "Confection (10 à 15 jours ouvrés)",
    text: "Notre atelier prépare votre création à la main",
  },
  { title: "Expédition", text: "Vous recevrez un email avec le numéro de suivi" },
  { title: "Livraison", text: "Réception à votre domicile" },
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value);

const detailStyle = {
  color: t.ink3,
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 2px 0",
};

const sectionStyle = {
  padding: "24px 0",
  borderTop: `1px solid ${t.rule}`,
};

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  total,
  shipping,
  shippingAddress,
}: OrderConfirmationEmailProps) {
  const finalTotal = total + shipping;

  return (
    <EmailLayout>
      <tr>
        <td style={{ padding: "24px 40px 8px", textAlign: "center" }}>
          <EmailHeading overline="Commande confirmée">
            Merci {customerName}
          </EmailHeading>
          <p
            style={{
              color: t.ink,
              fontSize: "15px",
              lineHeight: "1.7",
              margin: "0 0 24px 0",
            }}
          >
            Nous avons bien reçu votre commande. Notre atelier va confectionner
            avec soin votre création unique.
          </p>
          <p
            style={{
              display: "inline-block",
              margin: "0 0 32px 0",
              padding: "10px 20px",
              backgroundColor: t.paper2,
              color: t.ink,
              fontSize: "13px",
              letterSpacing: "0.08em",
            }}
          >
            Commande <strong style={{ fontWeight: 500 }}>{orderNumber}</strong>
          </p>
        </td>
      </tr>

      <tr>
        <td style={{ padding: "0 40px" }}>
          {/* Articles */}
          <div style={sectionStyle}>
            <EmailSectionTitle>Détail de votre commande</EmailSectionTitle>
            {items.map((item, index) => (
              <table
                key={index}
                cellPadding="0"
                cellSpacing="0"
                border={0}
                role="presentation"
                style={{
                  width: "100%",
                  marginBottom: index < items.length - 1 ? "18px" : 0,
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ verticalAlign: "top" }}>
                      <p
                        style={{
                          fontFamily: t.fontDisplay,
                          color: t.ink,
                          fontSize: "19px",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {item.productName}
                      </p>
                      <p style={detailStyle}>
                        Tissu : {item.configuration.fabricName}
                      </p>
                      {item.configuration.embroidery && (
                        <p style={detailStyle}>
                          Broderie : « {item.configuration.embroidery} »
                          {item.configuration.embroideryFont &&
                            ` · ${item.configuration.embroideryFont}`}
                          {item.configuration.embroideryColor &&
                            ` · fil ${item.configuration.embroideryColorName ?? item.configuration.embroideryColor}`}
                        </p>
                      )}
                      <p style={detailStyle}>Quantité : {item.quantity}</p>
                    </td>
                    <td
                      style={{
                        verticalAlign: "top",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                        color: t.ink,
                        fontSize: "14px",
                        paddingLeft: "16px",
                      }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </td>
                  </tr>
                </tbody>
              </table>
            ))}
          </div>

          {/* Totaux */}
          <div style={sectionStyle}>
            <table
              cellPadding="0"
              cellSpacing="0"
              border={0}
              role="presentation"
              style={{ width: "100%", fontSize: "14px" }}
            >
              <tbody>
                <tr>
                  <td style={{ color: t.ink3, padding: "3px 0" }}>Sous-total</td>
                  <td style={{ color: t.ink, textAlign: "right" }}>
                    {formatPrice(total)}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: t.ink3, padding: "3px 0" }}>Livraison</td>
                  <td style={{ color: t.ink, textAlign: "right" }}>
                    {shipping === 0 ? "Offerte" : formatPrice(shipping)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      color: t.ink,
                      fontSize: "11px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      paddingTop: "14px",
                    }}
                  >
                    Total
                  </td>
                  <td
                    style={{
                      fontFamily: t.fontDisplay,
                      color: t.ink,
                      fontSize: "26px",
                      textAlign: "right",
                      paddingTop: "14px",
                    }}
                  >
                    {formatPrice(finalTotal)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Adresse */}
          {shippingAddress && (
            <div style={sectionStyle}>
              <EmailSectionTitle>Adresse de livraison</EmailSectionTitle>
              <p
                style={{
                  color: t.ink,
                  fontSize: "14px",
                  lineHeight: "1.6",
                  margin: 0,
                }}
              >
                {shippingAddress.address}
                <br />
                {shippingAddress.addressComplement && (
                  <>
                    {shippingAddress.addressComplement}
                    <br />
                  </>
                )}
                {shippingAddress.postalCode} {shippingAddress.city}
                <br />
                {shippingAddress.country}
              </p>
            </div>
          )}

          {/* Prochaines étapes */}
          <div style={sectionStyle}>
            <EmailSectionTitle>Prochaines étapes</EmailSectionTitle>
            <table
              cellPadding="0"
              cellSpacing="0"
              border={0}
              role="presentation"
              style={{ width: "100%" }}
            >
              <tbody>
                {NEXT_STEPS.map((step, index) => (
                  <tr key={step.title}>
                    <td
                      style={{
                        width: "32px",
                        verticalAlign: "top",
                        fontFamily: t.fontDisplay,
                        color: t.accent,
                        fontSize: "20px",
                        lineHeight: "1.1",
                        paddingBottom: "14px",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ paddingBottom: "14px" }}>
                      <p style={{ color: t.ink, fontSize: "14px", margin: 0 }}>
                        {step.title}
                      </p>
                      <p style={{ ...detailStyle, margin: 0 }}>{step.text}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </td>
      </tr>

      <tr>
        <td style={{ padding: "8px 40px 36px", textAlign: "center" }}>
          <EmailButton href={`${APP_URL}/orders`}>Suivre ma commande</EmailButton>
          <p style={{ color: t.ink3, fontSize: "12px", lineHeight: "1.6", margin: 0 }}>
            Une question sur votre commande ? Répondez simplement à cet email ou
            passez par notre{" "}
            <a href={`${APP_URL}/contact`} style={{ color: t.accent }}>
              page contact
            </a>
            .
          </p>
        </td>
      </tr>
    </EmailLayout>
  );
}
