/** Issuer details — aligned with sample invoice.pdf in project root. */
export const SARVADHARA_INVOICE_FROM = {
  /** Shown under the logo on invoices */
  displayName: 'Sarvadhara Tech Innovations',
  legalName: 'Sarvadhara Tech Innovations Pvt Ltd',
  /** Dedicated circular mark — `Sarvadhara_logo_invoice.png` in public/logo */
  logoPath: '/logo/sarvadhara-invoice.png',
  addressBlock: 'Vijayawada,\nAndhra Pradesh, India - 520008',
  phone: '+91 90639 86415',
  phoneTel: '+919063986415',
  email: 'Sarvadharatechinnovations@gmail.com',
  enquiryFooter:
    'For any enquiry, reach out via email at Sarvadharatechinnovations@gmail.com , call on +91 90639 86415',
  /** Override via NEXT_PUBLIC_SARVADHARA_GSTIN in .env.local when set */
  gstin: (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SARVADHARA_GSTIN?.trim()) || '',
}
