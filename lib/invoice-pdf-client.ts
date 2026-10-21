'use client'

/** A4 content width at 96dpi — matches browser print layout for the invoice sheet. */
const INVOICE_CAPTURE_WIDTH_PX = 794

export function invoicePdfFileName(invoiceNumber: string, projectName: string): string {
  const safe = projectName.replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-') || 'client'
  return `Sarvadhara-Invoice-${invoiceNumber}-${safe}.pdf`
}

async function waitForInvoiceAssets(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        })
    )
  )
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready
  }
}

function prepareCloneForCapture(source: HTMLElement): { wrapper: HTMLDivElement; clone: HTMLElement } {
  const clone = source.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  clone.classList.add('invoice-pdf-capture-sheet')
  clone.style.boxShadow = 'none'
  clone.style.maxWidth = 'none'
  clone.style.width = `${INVOICE_CAPTURE_WIDTH_PX}px`
  clone.style.margin = '0'

  const wrapper = document.createElement('div')
  wrapper.className = 'invoice-pdf-capture-root'
  wrapper.setAttribute('aria-hidden', 'true')
  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)
  return { wrapper, clone }
}

export async function invoicePdfBlobFromElement(root: HTMLElement): Promise<Blob> {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')

  const { wrapper, clone } = prepareCloneForCapture(root)
  document.body.classList.add('printing-maintenance-invoice')

  try {
    await waitForInvoiceAssets(clone)

    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      width: INVOICE_CAPTURE_WIDTH_PX,
      windowWidth: INVOICE_CAPTURE_WIDTH_PX,
      onclone: (doc) => {
        const sheet = doc.querySelector('.invoice-pdf-capture-sheet') as HTMLElement | null
        if (sheet) {
          sheet.style.boxShadow = 'none'
          sheet.style.background = '#ffffff'
        }
        doc.querySelectorAll('.invoice-logo-wrap').forEach((el) => {
          ;(el as HTMLElement).style.filter = 'none'
        })
      },
    })

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()

    const imgData = canvas.toDataURL('image/png')
    let renderWidth = pageWidth
    let renderHeight = (canvas.height * renderWidth) / canvas.width

    if (renderHeight > pageHeight) {
      renderHeight = pageHeight
      renderWidth = (canvas.width * renderHeight) / canvas.height
    }

    const offsetX = (pageWidth - renderWidth) / 2
    pdf.addImage(imgData, 'PNG', offsetX, 0, renderWidth, renderHeight, undefined, 'FAST')

    return pdf.output('blob')
  } finally {
    document.body.classList.remove('printing-maintenance-invoice')
    wrapper.remove()
  }
}

export async function copyPdfBlobToClipboard(blob: Blob): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard?.write) return false
  if (typeof ClipboardItem === 'undefined') return false
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'application/pdf': blob,
      }),
    ])
    return true
  } catch {
    return false
  }
}

export function downloadPdfBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 2000)
}
