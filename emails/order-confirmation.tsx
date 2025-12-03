import * as React from 'react'

interface OrderConfirmationEmailProps {
  orderNumber: string
  customerName: string
  items: Array<{
    productName: string
    quantity: number
    price: number
    configuration: {
      fabricName: string
      embroidery?: string
      accessories: string[]
    }
  }>
  total: number
  shipping: number
  shippingAddress: {
    address: string
    addressComplement?: string
    postalCode: string
    city: string
    country: string
  }
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  total,
  shipping,
  shippingAddress
}: OrderConfirmationEmailProps) {
  const finalTotal = total + shipping

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'Arial, sans-serif', backgroundColor: '#f5f1e8' }}>
        <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }}>
          
          {/* Header */}
          <tr>
            <td style={{ background: 'linear-gradient(135deg, #b76e79 0%, #d4a89a 100%)', padding: '40px 20px', textAlign: 'center' }}>
              <h1 style={{ color: '#ffffff', fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
                Ylang Créations
              </h1>
              <p style={{ color: '#ffffff', fontSize: '14px', margin: 0, opacity: 0.95, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Atelier Textile Premium
              </p>
            </td>
          </tr>

          {/* Content */}
          <tr>
            <td style={{ padding: '40px 30px', backgroundColor: '#faf9f6' }}>
              
              {/* Greeting */}
              <h2 style={{ color: '#1a1a1a', fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                Bonjour {customerName},
              </h2>
              <p style={{ color: '#1a1a1a', fontSize: '16px', lineHeight: '1.6', margin: '0 0 30px 0', opacity: 0.8 }}>
                Nous sommes ravis de confirmer votre commande ! Notre atelier parisien va confectionner avec soin votre création unique.
              </p>

              {/* Order Number Card */}
              <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e8dcc8' }}>
                <tr>
                  <td style={{ padding: '20px' }}>
                    <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
                      <tr>
                        <td>
                          <p style={{ color: '#1a1a1a', opacity: 0.6, fontSize: '12px', margin: '0 0 5px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Numéro de commande
                          </p>
                          <p style={{ color: '#b76e79', fontSize: '28px', fontWeight: 'bold', margin: 0, letterSpacing: '-0.5px' }}>
                            {orderNumber}
                          </p>
                        </td>
                        <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                          <div style={{ width: '60px', height: '60px', backgroundColor: '#f5f1e8', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '30px' }}>✓</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              {/* Order Items */}
              <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e8dcc8' }}>
                <tr>
                  <td style={{ padding: '20px' }}>
                    <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
                      Détail de votre commande
                    </h3>

                    {items.map((item, index) => (
                      <React.Fragment key={index}>
                        <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginBottom: index < items.length - 1 ? '20px' : '0', paddingBottom: index < items.length - 1 ? '20px' : '0', borderBottom: index < items.length - 1 ? '1px solid #f5f1e8' : 'none' }}>
                          <tr>
                            <td style={{ verticalAlign: 'top', width: '70%' }}>
                              <p style={{ color: '#1a1a1a', fontSize: '16px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
                                {item.productName}
                              </p>
                              <p style={{ color: '#1a1a1a', opacity: 0.6, fontSize: '14px', margin: '0 0 4px 0' }}>
                                Tissu: {item.configuration.fabricName}
                              </p>
                              {item.configuration.embroidery && (
                                <p style={{ color: '#1a1a1a', opacity: 0.6, fontSize: '14px', margin: '0 0 4px 0' }}>
                                  Broderie: "{item.configuration.embroidery}"
                                </p>
                              )}
                              {item.configuration.accessories.length > 0 && (
                                <p style={{ color: '#1a1a1a', opacity: 0.6, fontSize: '14px', margin: '0 0 4px 0' }}>
                                  Accessoires: {item.configuration.accessories.join(', ')}
                                </p>
                              )}
                              <p style={{ color: '#1a1a1a', opacity: 0.6, fontSize: '14px', margin: '4px 0 0 0' }}>
                                Quantité: {item.quantity}
                              </p>
                            </td>
                            <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                              <p style={{ color: '#b76e79', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                                {(item.price * item.quantity).toFixed(2)}€
                              </p>
                            </td>
                          </tr>
                        </table>
                      </React.Fragment>
                    ))}

                    {/* Totals */}
                    <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e8dcc8' }}>
                      <tr>
                        <td style={{ padding: '5px 0' }}>
                          <p style={{ color: '#1a1a1a', opacity: 0.7, fontSize: '14px', margin: 0 }}>
                            Sous-total
                          </p>
                        </td>
                        <td style={{ textAlign: 'right', padding: '5px 0' }}>
                          <p style={{ color: '#1a1a1a', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                            {total.toFixed(2)}€
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '5px 0' }}>
                          <p style={{ color: '#1a1a1a', opacity: 0.7, fontSize: '14px', margin: 0 }}>
                            Livraison
                          </p>
                        </td>
                        <td style={{ textAlign: 'right', padding: '5px 0' }}>
                          <p style={{ color: shipping === 0 ? '#16a34a' : '#1a1a1a', fontSize: '14px', fontWeight: '600', margin: 0 }}>
                            {shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)}€`}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '15px 0 0 0' }}>
                          <p style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                            Total
                          </p>
                        </td>
                        <td style={{ textAlign: 'right', padding: '15px 0 0 0' }}>
                          <p style={{ color: '#b76e79', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                            {finalTotal.toFixed(2)}€
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              {/* Shipping Address */}
              <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e8dcc8' }}>
                <tr>
                  <td style={{ padding: '20px' }}>
                    <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: '0 0 15px 0' }}>
                      Adresse de livraison
                    </h3>
                    <p style={{ color: '#1a1a1a', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      {shippingAddress.address}<br />
                      {shippingAddress.addressComplement && <>{shippingAddress.addressComplement}<br /></>}
                      {shippingAddress.postalCode} {shippingAddress.city}<br />
                      {shippingAddress.country}
                    </p>
                  </td>
                </tr>
              </table>

              {/* Next Steps */}
              <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e8dcc8' }}>
                <tr>
                  <td style={{ padding: '20px' }}>
                    <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
                      Prochaines étapes
                    </h3>

                    <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
                      <tr>
                        <td style={{ width: '40px', verticalAlign: 'top', paddingBottom: '15px' }}>
                          <div style={{ width: '32px', height: '32px', backgroundColor: '#b76e79', borderRadius: '50%', color: '#ffffff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            1
                          </div>
                        </td>
                        <td style={{ paddingBottom: '15px' }}>
                          <p style={{ color: '#1a1a1a', fontSize: '14px', margin: 0 }}>
                            <strong>Confirmation</strong><br />
                            <span style={{ opacity: 0.7 }}>Votre commande est confirmée</span>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '40px', verticalAlign: 'top', paddingBottom: '15px' }}>
                          <div style={{ width: '32px', height: '32px', backgroundColor: '#d4a89a', borderRadius: '50%', color: '#ffffff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            2
                          </div>
                        </td>
                        <td style={{ paddingBottom: '15px' }}>
                          <p style={{ color: '#1a1a1a', fontSize: '14px', margin: 0 }}>
                            <strong>Confection (7-10 jours)</strong><br />
                            <span style={{ opacity: 0.7 }}>Notre atelier prépare votre création avec soin</span>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '40px', verticalAlign: 'top', paddingBottom: '15px' }}>
                          <div style={{ width: '32px', height: '32px', backgroundColor: '#e8dcc8', borderRadius: '50%', color: '#1a1a1a', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            3
                          </div>
                        </td>
                        <td style={{ paddingBottom: '15px' }}>
                          <p style={{ color: '#1a1a1a', fontSize: '14px', margin: 0 }}>
                            <strong>Expédition</strong><br />
                            <span style={{ opacity: 0.7 }}>Vous recevrez un email avec le numéro de suivi</span>
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '40px', verticalAlign: 'top' }}>
                          <div style={{ width: '32px', height: '32px', backgroundColor: '#f5f1e8', borderRadius: '50%', color: '#1a1a1a', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            4
                          </div>
                        </td>
                        <td>
                          <p style={{ color: '#1a1a1a', fontSize: '14px', margin: 0 }}>
                            <strong>Livraison</strong><br />
                            <span style={{ opacity: 0.7 }}>Réception à votre domicile</span>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              {/* CTA Button */}
              <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginBottom: '30px' }}>
                <tr>
                  <td style={{ textAlign: 'center' }}>
                    <a href={`${process.env.NEXT_PUBLIC_APP_URL}/orders/${orderNumber}`} style={{
                      display: 'inline-block',
                      padding: '16px 40px',
                      background: 'linear-gradient(135deg, #b76e79 0%, #d4a89a 100%)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(183, 110, 121, 0.3)'
                    }}>
                      Suivre ma commande
                    </a>
                  </td>
                </tr>
              </table>

              {/* Help Section */}
              <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', backgroundColor: '#f5f1e8', borderRadius: '12px', padding: '20px' }}>
                <tr>
                  <td style={{ textAlign: 'center' }}>
                    <p style={{ color: '#1a1a1a', fontSize: '14px', margin: '0 0 10px 0' }}>
                      <strong>Une question sur votre commande ?</strong>
                    </p>
                    <p style={{ color: '#1a1a1a', opacity: 0.7, fontSize: '14px', margin: 0 }}>
                      Notre équipe est là pour vous aider<br />
                      📧 <a href="mailto:contact@ylang-creations.fr" style={{ color: '#b76e79', textDecoration: 'none' }}>contact@ylang-creations.fr</a><br />
                      📞 +33 6 12 34 56 78
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td style={{ padding: '30px 20px', textAlign: 'center', backgroundColor: '#f5f1e8' }}>
              <p style={{ color: '#1a1a1a', opacity: 0.6, fontSize: '14px', margin: '0 0 15px 0' }}>
                Merci de faire confiance à Ylang Créations
              </p>
              <table cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%', marginBottom: '15px' }}>
                <tr>
                  <td style={{ textAlign: 'center' }}>
                    <a href="https://instagram.com/ylang.creations" style={{ display: 'inline-block', margin: '0 10px', color: '#b76e79', textDecoration: 'none' }}>
                      Instagram
                    </a>
                    <a href="https://facebook.com/ylangcreations" style={{ display: 'inline-block', margin: '0 10px', color: '#b76e79', textDecoration: 'none' }}>
                      Facebook
                    </a>
                    <a href="https://pinterest.com/ylangcreations" style={{ display: 'inline-block', margin: '0 10px', color: '#b76e79', textDecoration: 'none' }}>
                      Pinterest
                    </a>
                  </td>
                </tr>
              </table>
              <p style={{ color: '#1a1a1a', opacity: 0.5, fontSize: '12px', margin: 0 }}>
                © 2024 Ylang Créations - Atelier textile premium<br />
                12 rue de l'Artisanat, 75011 Paris, France
              </p>
            </td>
          </tr>

        </table>
      </body>
    </html>
  )
}