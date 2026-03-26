import crypto from 'crypto'
import { NextResponse } from 'next/server'

type VerifyBody = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export async function POST(req: Request) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keySecret) {
      return NextResponse.json(
        { error: 'Razorpay secret is missing in environment variables.' },
        { status: 500 }
      )
    }

    const body = (await req.json()) as VerifyBody
    const payload = `${body.razorpay_order_id}|${body.razorpay_payment_id}`
    const expectedSignature = crypto.createHmac('sha256', keySecret).update(payload).digest('hex')

    if (expectedSignature !== body.razorpay_signature) {
      return NextResponse.json({ verified: false, error: 'Payment signature mismatch.' }, { status: 400 })
    }

    return NextResponse.json({ verified: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Verification failed.'
    return NextResponse.json({ verified: false, error: message }, { status: 500 })
  }
}
