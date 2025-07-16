"use client"

import { createContext, useContext } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  "pk_test_51Rl8JiDiF7DP9Ei0Hi6fCD2570Dh5V1zv42WONYgFqv8GsEJcGOewCmgVzi4lwqrAPxabijoPbSfSceiV0zY0TF000hsfVIFFI",
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
