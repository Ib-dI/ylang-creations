// app/api/create-payment-intent/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const { amount } = await req.json()

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // centimes
    currency: 'eur',
  })

  return Response.json({ clientSecret: paymentIntent.client_secret })
}