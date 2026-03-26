'use client'

import { FormEvent, useState } from 'react'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void
    }
  }
}

const suggestedAmounts = [1, 2, 3, 4]

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector('script[data-razorpay="true"]')
    if (existing) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpay = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function DonatePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState<number>(1000)
  const [status, setStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  async function handleDonate(e: FormEvent) {
    e.preventDefault()
    setStatus('')

    if (!amount || amount < 1) {
      setStatus('Please enter a valid donation amount.')
      return
    }

    setLoading(true)
    try {
      const scriptReady = await loadRazorpayScript()
      if (!scriptReady) {
        setStatus('Could not load Razorpay checkout. Please try again.')
        return
      }

      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name, email }),
      })

      const orderData = (await orderRes.json()) as {
        error?: string
        orderId?: string
        amount?: number
        currency?: string
        key?: string
      }

      if (!orderRes.ok || !orderData.orderId || !orderData.key) {
        setStatus(orderData.error || 'Failed to create payment order.')
        return
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Sarvadhara Tech Innovations',
        description: 'Donation',
        order_id: orderData.orderId,
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          })

          const verifyData = (await verifyRes.json()) as { verified?: boolean; error?: string }
          if (verifyRes.ok && verifyData.verified) {
            setStatus('Donation successful. Thank you for supporting Sarvadhara!')
          } else {
            setStatus(verifyData.error || 'Payment verification failed.')
          }
        },
        prefill: {
          name,
          email,
        },
        theme: {
          color: '#bfc3cc',
        },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-luxury-black pt-32 pb-20 px-6">
      <section className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-luxury text-platinum-metallic mb-4">Donate to Sarvadhara</h1>
          <p className="text-platinum-200 text-base md:text-lg">
            Your support helps us build impactful technology solutions for communities and businesses.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleDonate}
          className="glass-morphism rounded-2xl p-6 md:p-8 space-y-6"
        >
          <div className="space-y-2">
            <label className="block text-platinum-200 text-sm">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg bg-luxury-black border border-platinum-300/30 text-platinum-100 outline-none focus:border-platinum-metallic"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-platinum-200 text-sm">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg bg-luxury-black border border-platinum-300/30 text-platinum-100 outline-none focus:border-platinum-metallic"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-platinum-200 text-sm">Amount (INR)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {suggestedAmounts.map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setAmount(value)}
                  className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                    amount === value
                      ? 'border-platinum-metallic text-platinum-metallic'
                      : 'border-platinum-300/30 text-platinum-300 hover:border-platinum-300/50'
                  }`}
                >
                  Rs. {value}
                </button>
              ))}
            </div>
            <input
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min={1}
              type="number"
              placeholder="Enter custom amount"
              className="w-full px-4 py-3 rounded-lg bg-luxury-black border border-platinum-300/30 text-platinum-100 outline-none focus:border-platinum-metallic"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-5 py-3 rounded-lg border border-platinum-metallic text-platinum-metallic hover:bg-platinum-metallic hover:text-luxury-black transition-all disabled:opacity-60"
          >
            {loading ? 'Processing...' : 'Donate with Razorpay'}
          </button>

          {status && <p className="text-sm text-platinum-200 text-center">{status}</p>}
        </motion.form>
      </section>
    </main>
  )
}
