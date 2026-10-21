import { notFound } from 'next/navigation'
import MaintenanceInvoiceShareView from '@/components/automate/MaintenanceInvoiceShareView'
import { getMaintenanceInvoiceShare } from '@/lib/crm-invoice-shares-store'

export default async function PublicMaintenanceInvoicePage({
  params,
  searchParams,
}: {
  params: { shareId: string }
  searchParams: { autoprint?: string }
}) {
  const share = await getMaintenanceInvoiceShare(params.shareId)
  if (!share) notFound()

  return <MaintenanceInvoiceShareView share={share} autoprint={searchParams.autoprint === '1'} />
}
