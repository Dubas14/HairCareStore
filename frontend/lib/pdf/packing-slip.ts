import jsPDF from 'jspdf'

// ─── Types ──────────────────────────────────────────────────────────────────

interface PackingSlipOrder {
  displayId?: number
  email?: string
  createdAt?: string
  items?: Array<{
    productTitle: string
    variantTitle?: string
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  shippingAddress?: {
    firstName?: string
    lastName?: string
    phone?: string
    city?: string
    address1?: string
  }
  paymentMethod?: string
  shippingMethod?: string
  subtotal?: number
  shippingTotal?: number
  total?: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const UK_MONTHS = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
]

const PAYMENT_METHODS: Record<string, string> = {
  cod: 'Накладний платіж',
  card: 'Картка',
  online: 'Онлайн оплата',
}

function formatDateUk(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return `${d.getDate()} ${UK_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatPrice(n?: number): string {
  if (n == null) return '0'
  return n.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function nowDateUk(): string {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()} ${UK_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${h}:${m}`
}

// ─── Font Loader ────────────────────────────────────────────────────────────

let fontCache: { regular: string; bold: string } | null = null

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function loadFonts(doc: jsPDF): Promise<void> {
  if (!fontCache) {
    const [regularBuf, boldBuf] = await Promise.all([
      fetch('/fonts/Inter-Regular.ttf').then((r) => r.arrayBuffer()),
      fetch('/fonts/Inter-Bold.ttf').then((r) => r.arrayBuffer()),
    ])
    fontCache = {
      regular: toBase64(regularBuf),
      bold: toBase64(boldBuf),
    }
  }

  // Register fonts on every new jsPDF instance
  doc.addFileToVFS('Inter-Regular.ttf', fontCache.regular)
  doc.addFileToVFS('Inter-Bold.ttf', fontCache.bold)
  doc.addFont('Inter-Regular.ttf', 'Inter', 'normal')
  doc.addFont('Inter-Bold.ttf', 'Inter', 'bold')
}

// ─── PDF Generator ──────────────────────────────────────────────────────────

export async function generatePackingSlip(order: PackingSlipOrder): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  // Load Cyrillic fonts
  await loadFonts(doc)

  const pageW = doc.internal.pageSize.getWidth()
  const marginL = 20
  const marginR = 20
  let y = 20

  // ── Header ──
  doc.setFontSize(20)
  doc.setFont('Inter', 'bold')
  doc.text('HAIR LAB', marginL, y)

  doc.setFontSize(10)
  doc.setFont('Inter', 'normal')
  doc.setTextColor(120, 120, 120)
  doc.text(`Друк: ${nowDateUk()}`, pageW - marginR, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  y += 8
  doc.setFontSize(14)
  doc.setFont('Inter', 'bold')
  doc.text('Пакувальна накладна', marginL, y)

  y += 10
  doc.setDrawColor(200, 200, 200)
  doc.line(marginL, y, pageW - marginR, y)
  y += 8

  // ── Order info ──
  doc.setFontSize(10)
  doc.setFont('Inter', 'bold')
  doc.text(`Замовлення #${order.displayId || '—'}`, marginL, y)
  doc.setFont('Inter', 'normal')
  doc.text(`Дата: ${formatDateUk(order.createdAt)}`, pageW - marginR, y, { align: 'right' })
  y += 10

  // ── Shipping address ──
  const addr = order.shippingAddress
  if (addr) {
    doc.setFont('Inter', 'bold')
    doc.setFontSize(10)
    doc.text('Адреса доставки:', marginL, y)
    y += 5
    doc.setFont('Inter', 'normal')
    doc.setFontSize(9)

    const fullName = [addr.firstName, addr.lastName].filter(Boolean).join(' ')
    if (fullName) { doc.text(fullName, marginL, y); y += 4.5 }
    if (addr.phone) { doc.text(`Тел: ${addr.phone}`, marginL, y); y += 4.5 }
    if (addr.city) { doc.text(`Місто: ${addr.city}`, marginL, y); y += 4.5 }
    if (addr.address1) { doc.text(`Відділення: ${addr.address1}`, marginL, y); y += 4.5 }
    y += 4
  }

  // ── Items table ──
  doc.setDrawColor(200, 200, 200)
  doc.line(marginL, y, pageW - marginR, y)
  y += 6

  // Table header
  const colX = {
    num: marginL,
    name: marginL + 10,
    variant: marginL + 90,
    qty: marginL + 120,
    price: marginL + 138,
    sum: pageW - marginR,
  }

  doc.setFont('Inter', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('#', colX.num, y)
  doc.text('Назва', colX.name, y)
  doc.text('Варіант', colX.variant, y)
  doc.text('К-сть', colX.qty, y)
  doc.text('Ціна', colX.price, y)
  doc.text('Сума', colX.sum, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)

  y += 3
  doc.line(marginL, y, pageW - marginR, y)
  y += 5

  // Table rows
  doc.setFont('Inter', 'normal')
  doc.setFontSize(9)

  const nameColWidth = colX.variant - colX.name - 2 // max width for product name
  const lineHeight = 4.2

  const items = order.items || []
  items.forEach((item, idx) => {
    // Wrap product name into multiple lines
    const nameLines: string[] = doc.splitTextToSize(item.productTitle, nameColWidth)
    const rowHeight = Math.max(nameLines.length * lineHeight, 6)

    // Check if we need a new page
    if (y + rowHeight > 260) {
      doc.addPage()
      y = 20
    }

    doc.text(String(idx + 1), colX.num, y)
    doc.text(nameLines, colX.name, y)
    doc.text(item.variantTitle || '—', colX.variant, y)
    doc.text(String(item.quantity), colX.qty, y)
    doc.text(formatPrice(item.unitPrice), colX.price, y)
    doc.text(formatPrice(item.subtotal), colX.sum, y, { align: 'right' })
    y += rowHeight + 1.5
  })

  y += 2
  doc.line(marginL, y, pageW - marginR, y)
  y += 8

  // ── Totals ──
  doc.setFontSize(9)
  const totalsX = pageW - marginR - 60
  const totalsValX = pageW - marginR

  doc.setFont('Inter', 'normal')
  doc.text('Підсумок товарів:', totalsX, y)
  doc.text(`${formatPrice(order.subtotal)} ₴`, totalsValX, y, { align: 'right' })
  y += 5.5

  doc.text('Доставка:', totalsX, y)
  doc.text(`${formatPrice(order.shippingTotal)} ₴`, totalsValX, y, { align: 'right' })
  y += 5.5

  doc.setFont('Inter', 'bold')
  doc.setFontSize(10)
  doc.text('Загальна сума:', totalsX, y)
  doc.text(`${formatPrice(order.total)} ₴`, totalsValX, y, { align: 'right' })
  y += 10

  // ── Payment & shipping method ──
  doc.setFontSize(9)
  doc.setFont('Inter', 'normal')
  doc.setTextColor(80, 80, 80)

  if (order.paymentMethod) {
    const pm = PAYMENT_METHODS[order.paymentMethod] || order.paymentMethod
    doc.text(`Спосіб оплати: ${pm}`, marginL, y)
    y += 5
  }
  if (order.shippingMethod) {
    doc.text(`Спосіб доставки: ${order.shippingMethod}`, marginL, y)
    y += 5
  }

  // ── Footer ──
  y = Math.max(y + 15, 250)
  if (y > 270) {
    doc.addPage()
    y = 20
  }
  doc.setDrawColor(200, 200, 200)
  doc.line(marginL, y, pageW - marginR, y)
  y += 6
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 120)
  doc.setFont('Inter', 'normal')
  doc.text('Дякуємо за покупку! HAIR LAB', pageW / 2, y, { align: 'center' })

  // ── Open in new window ──
  const pdfBlob = doc.output('blob')
  const url = URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}
