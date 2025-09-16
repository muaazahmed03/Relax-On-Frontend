"use client"

import { createContext, useContext } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  "pk_live_51S5CQiLVyJc2DfAdEivaxxo46MUv8Bz7bw02YIbgppcIyiB1GtQ2zFnGgHP2OJxVjiMIQhHgQ57FDyJNqmCOKHC800R6gHQYl8",
)

const StripeContext = createContext()

export const useStripeContext = () => {
  const context = useContext(StripeContext)
  if (!context) {
    throw new Error("useStripeContext must be used within StripeProvider")
  }
  return context
}

export const StripeProvider = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      <StripeContext.Provider value={{}}>{children}</StripeContext.Provider>
    </Elements>
  )
}
