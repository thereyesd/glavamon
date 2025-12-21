import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
let stripePromise = null

export function getStripe() {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (key) {
      stripePromise = loadStripe(key)
    }
  }
  return stripePromise
}

// Create payment intent (would normally call your backend/Cloud Function)
// For now, this is a mock that simulates the flow
export async function createPaymentIntent(amount, currency = 'eur', metadata = {}) {
  // In production, this would call your backend:
  // const response = await fetch('/api/create-payment-intent', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount, currency, metadata })
  // })
  // return response.json()

  // Mock response for development
  console.log('Creating payment intent:', { amount, currency, metadata })
  return {
    clientSecret: 'mock_client_secret',
    paymentIntentId: 'pi_mock_' + Date.now()
  }
}

// Confirm payment (after Stripe Elements submission)
export async function confirmPayment(stripe, elements, clientSecret) {
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    clientSecret,
    confirmParams: {
      return_url: `${window.location.origin}/booking/success`
    },
    redirect: 'if_required'
  })

  if (error) {
    throw new Error(error.message)
  }

  return paymentIntent
}

// Process card payment
export async function processCardPayment(stripe, cardElement, clientSecret, billingDetails) {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: billingDetails
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  return paymentIntent
}

// Format price for display
export function formatPrice(amount, currency = 'EUR') {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(amount)
}

// Convert amount to cents (Stripe requires amounts in smallest currency unit)
export function amountToCents(amount) {
  return Math.round(amount * 100)
}

// Convert cents to amount
export function centsToAmount(cents) {
  return cents / 100
}
