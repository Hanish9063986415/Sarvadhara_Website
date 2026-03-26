import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

type CreateOrderBody = {
  amount: number
  name?: string
  email?: string
}

export async function POST(req: Request) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { error: 'Razorpay keys are missing in environment variables.' },
        { status: 500 }
      )
    }

    const body = (await req.json()) as CreateOrderBody
    const amount = Number(body.amount)

    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json({ error: 'Please enter a valid amount.' }, { status: 400 })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const receiptSuffix = Date.now().toString().slice(-10)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `donate_${receiptSuffix}`,
      notes: {
        donorName: body.name || '',
        donorEmail: body.email || '',
        purpose: 'Sarvadhara Donation',
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: keyId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
