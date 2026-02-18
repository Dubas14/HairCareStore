'use client'

/**
 * CsvImportModal — CSV product import modal for Payload CMS admin panel.
 *
 * Used inside ProductsListView at /admin/collections/products.
 * Supports 3 steps: file upload -> preview & mapping -> import & results.
 *
 * Usage:
 *   <CsvImportModal
 *     open={showImport}
 *     onClose={() => setShowImport(false)}
 *     onImportComplete={() => refetch()}
 *   />
 */

import React, { useCallback, useRef, useState } from 'react'
import Papa from 'papaparse'
import { importProducts } from '@/app/actions/product-import'
import type { CsvProductRow, ImportResult } from '@/app/actions/product-import'

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bgPrimary: 'var(--color-base-50)',
  bgSecondary: 'var(--color-base-50)',
  bgCard: 'var(--color-base-0)',
  border: 'var(--color-base-200)',
  sea400: '#7dd3d3',
  sea500: '#5bc4c4',
  sea600: '#4a9e9e',
  textPrimary: 'var(--color-base-700)',
  textSecondary: 'var(--color-base-500)',
  textMuted: 'var(--color-base-400)',
} as const

const BATCH_SIZE = 20

const FIELD_MAP: Record<string, string> = {
  title: 'title',
  назва: 'title',
  name: 'title',
  barcode: 'barcode',
  'штрих-код': 'barcode',
  штрихкод: 'barcode',
  handle: 'handle',
  slug: 'handle',
  subtitle: 'subtitle',
  підзаголовок: 'subtitle',
  brand: 'brand',
  бренд: 'brand',
  category: 'category',
  категорія: 'category',
  sku: 'sku',
  articlecode: 'articleCode',
  артикул: 'articleCode',
  suppliercode: 'supplierCode',
  'код постачальника': 'supplierCode',
  price: 'price',
  ціна: 'price',
  costprice: 'costPrice',
  собівартість: 'costPrice',
  compareatprice: 'compareAtPrice',
  'стара ціна': 'compareAtPrice',
  inventory: 'inventory',
  кількість: 'inventory',
  запас: 'inventory',
  instock: 'inStock',
  наявність: 'inStock',
  status: 'status',
  статус: 'status',
  tags: 'tags',
  теги: 'tags',
}

const PRODUCT_FIELDS = [
  { value: '', label: '— не імпортувати —' },
  { value: 'title', label: 'Назва' },
  { value: 'barcode', label: 'Штрих-код' },
  { value: 'handle', label: 'Slug / Handle' },
  { value: 'subtitle', label: 'Підзаголовок' },
  { value: 'brand', label: 'Бренд' },
  { value: 'category', label: 'Категорія' },
  { value: 'sku', label: 'SKU' },
  { value: 'articleCode', label: 'Артикул' },
  { value: 'supplierCode', label: 'Код постачальника' },
  { value: 'price', label: 'Ціна' },
  { value: 'costPrice', label: 'Собівартість' },
  { value: 'compareAtPrice', label: 'Стара ціна' },
  { value: 'inventory', label: 'Кількість на складі' },
  { value: 'inStock', label: 'Наявність (true/false)' },
  { value: 'status', label: 'Статус (draft/active/archived)' },
  { value: 'tags', label: 'Теги (через кому)' },
]

const TEMPLATE_COLUMNS = [
  { key: 'title', label: 'Назва', required: true, example: 'Шампунь Elgon Man Day Up, 250 мл' },
  { key: 'barcode', label: 'Штрих-код', required: false, example: '4820197000123' },
  { key: 'handle', label: 'URL-slug', required: false, example: 'shampun-elgon-man-day-up' },
  { key: 'subtitle', label: 'Підзаголовок', required: false, example: 'Elgon' },
  { key: 'brand', label: 'Бренд', required: false, example: 'Elgon' },
  { key: 'category', label: 'Категорія', required: false, example: 'Для чоловіків' },
  { key: 'sku', label: 'SKU', required: false, example: 'ELG-510442' },
  { key: 'articleCode', label: 'Артикул', required: false, example: '510442' },
  { key: 'supplierCode', label: 'Код постачальника', required: false, example: '000002145' },
  { key: 'price', label: 'Ціна (грн)', required: true, example: '489' },
  { key: 'costPrice', label: 'Собівартість', required: false, example: '326' },
  { key: 'compareAtPrice', label: 'Стара ціна', required: false, example: '599' },
  { key: 'inventory', label: 'Кількість', required: false, example: '100' },
  { key: 'inStock', label: 'Наявність', required: false, example: 'true' },
  { key: 'status', label: 'Статус', required: false, example: 'active' },
  { key: 'tags', label: 'Теги', required: false, example: 'догляд,чоловіче' },
] as const

const PRESETS_STORAGE_KEY = 'hairlab-csv-import-presets'

interface MappingPreset {
  name: string
  mapping: Record<string, string>
  delimiter: ';' | ','
}

function loadPresets(): MappingPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function savePresets(presets: MappingPreset[]) {
  localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets))
}

function downloadTemplate(selectedKeys: string[], includeExample: boolean, delimiter: ';' | ',') {
  const cols = TEMPLATE_COLUMNS.filter((c) => selectedKeys.includes(c.key))
  const headers = cols.map((c) => c.key).join(delimiter)
  let csv = headers + '\n'
  if (includeExample) {
    csv += cols.map((c) => c.example).join(delimiter) + '\n'
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'products-template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = 'upload' | 'preview' | 'importing' | 'results'

interface ParsedData {
  headers: string[]
  rows: Record<string, string>[]
}

interface RowValidation {
  hasError: boolean
  errorMessage: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function autoDetectMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {}
  for (const header of headers) {
    const normalized = header.toLowerCase().trim()
    if (FIELD_MAP[normalized]) {
      mapping[header] = FIELD_MAP[normalized]
    } else {
      mapping[header] = ''
    }
  }
  return mapping
}

/** Parse a price/number string, stripping thousand separators (spaces, commas, thin spaces). */
function parseNum(raw: string): number {
  if (!raw) return 0
  // Remove spaces, non-breaking spaces, thin spaces, commas used as thousand separators
  const cleaned = raw.replace(/[\s\u00A0\u202F]/g, '').replace(/,/g, '.')
  // If multiple dots remain (e.g. "1.289.00"), keep only last one as decimal
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    const decimal = parts.pop()!
    return parseFloat(parts.join('') + '.' + decimal) || 0
  }
  return parseFloat(cleaned) || 0
}

function transformRow(rawRow: Record<string, string>, mapping: Record<string, string>): CsvProductRow {
  const get = (field: string) => {
    const csvCol = Object.entries(mapping).find(([, v]) => v === field)?.[0]
    return csvCol ? (rawRow[csvCol] || '').trim() : ''
  }

  return {
    title: get('title'),
    barcode: get('barcode') || undefined,
    handle: get('handle') || undefined,
    subtitle: get('subtitle') || undefined,
    brand: get('brand') || undefined,
    category: get('category') || undefined,
    sku: get('sku') || undefined,
    articleCode: get('articleCode') || undefined,
    supplierCode: get('supplierCode') || undefined,
    price: parseNum(get('price')),
    costPrice: parseNum(get('costPrice')) || undefined,
    compareAtPrice: parseNum(get('compareAtPrice')) || undefined,
    inventory: Math.round(parseNum(get('inventory'))) || undefined,
    inStock: get('inStock') ? get('inStock').toLowerCase() === 'true' : undefined,
    status: (['draft', 'active', 'archived'].includes(get('status')) ? get('status') : undefined) as
      | 'draft'
      | 'active'
      | 'archived'
      | undefined,
    tags: get('tags') || undefined,
  }
}

function validateRow(rawRow: Record<string, string>, mapping: Record<string, string>): RowValidation {
  const get = (field: string) => {
    const csvCol = Object.entries(mapping).find(([, v]) => v === field)?.[0]
    return csvCol ? (rawRow[csvCol] || '').trim() : ''
  }
  const title = get('title')
  const price = get('price')
  if (!title) return { hasError: true, errorMessage: 'Відсутня назва товару' }
  if (price && (parseNum(price) <= 0)) return { hasError: true, errorMessage: 'Некоректна ціна' }
  return { hasError: false, errorMessage: '' }
}


// ─── SVG Icons ────────────────────────────────────────────────────────────────

function IconUpload({ size = 40, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function IconCheck({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function IconWarning({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function IconClose({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconDownload({ size = 15, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function IconFile({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

// ─── Step Indicator ──────────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: Step
}

function StepIndicator({ current }: StepIndicatorProps) {
  const steps: { key: Step | 'results'; label: string }[] = [
    { key: 'upload', label: 'Завантаження' },
    { key: 'preview', label: 'Перегляд' },
    { key: 'importing', label: 'Імпорт' },
  ]

  const activeIndex =
    current === 'upload' ? 0 : current === 'preview' ? 1 : 2

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: 24,
      }}
    >
      {steps.map((step, idx) => {
        const isComplete = idx < activeIndex
        const isActive = idx === activeIndex
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: isComplete ? COLORS.sea500 : isActive ? COLORS.sea400 : COLORS.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                {isComplete ? (
                  <IconCheck size={15} color="#fff" />
                ) : (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: isActive ? '#fff' : COLORS.textMuted,
                    }}
                  >
                    {idx + 1}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? COLORS.textPrimary : COLORS.textMuted,
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: idx < activeIndex ? COLORS.sea500 : COLORS.border,
                  margin: '0 8px',
                  marginBottom: 22,
                  transition: 'background 0.2s',
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CsvImportModalProps {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
}

export function CsvImportModal({ open, onClose, onImportComplete }: CsvImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [delimiter, setDelimiter] = useState<';' | ','>( ';')
  const [fileName, setFileName] = useState('')
  const [step, setStep] = useState<Step>('upload')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState('')

  // Template builder state
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false)
  const [templateColumns, setTemplateColumns] = useState<string[]>(
    TEMPLATE_COLUMNS.filter((c) => c.required).map((c) => c.key)
  )
  const [templateIncludeExample, setTemplateIncludeExample] = useState(true)

  // Presets state
  const [presets, setPresets] = useState<MappingPreset[]>([])

  // ── Reset when modal opens ──────────────────────────────────────────────────
  const handleOpen = useCallback(() => {
    setStep('upload')
    setParsedData(null)
    setMapping({})
    setFileName('')
    setImportProgress(0)
    setImportResult(null)
    setImportError('')
    setIsDragging(false)
    setShowTemplateBuilder(false)
    setPresets(loadPresets())
  }, [])

  React.useEffect(() => {
    if (open) handleOpen()
  }, [open, handleOpen])

  // ── CSV Parsing ────────────────────────────────────────────────────────────
  const parseFile = useCallback(
    (file: File) => {
      setFileName(file.name)
      Papa.parse<Record<string, string>>(file, {
        header: true,
        delimiter,
        skipEmptyLines: true,
        complete: (result) => {
          const headers = result.meta.fields || []
          const rows = result.data as Record<string, string>[]
          const detected = autoDetectMapping(headers)
          setParsedData({ headers, rows })
          setMapping(detected)
          setStep('preview')
        },
        error: (err) => {
          setImportError(`Помилка парсингу: ${err.message}`)
        },
      })
    },
    [delimiter],
  )

  // ── Drag & Drop handlers ────────────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.csv')) {
      parseFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  // ── Import ─────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!parsedData) return
    setStep('importing')
    setImportProgress(0)
    setImportError('')

    const allRows = parsedData.rows
    const totalBatches = Math.ceil(allRows.length / BATCH_SIZE)
    const aggregated: ImportResult = { created: 0, updated: 0, errors: [], total: allRows.length }

    try {
      for (let b = 0; b < totalBatches; b++) {
        const batchStart = b * BATCH_SIZE
        const batchRaw = allRows.slice(batchStart, batchStart + BATCH_SIZE)
        const batchRows: CsvProductRow[] = batchRaw.map((row) => transformRow(row, mapping))

        const result = await importProducts(batchRows)
        aggregated.created += result.created
        aggregated.updated += result.updated
        // Offset row numbers to be global (not per-batch)
        aggregated.errors.push(
          ...result.errors.map((e) => ({ ...e, row: e.row + batchStart })),
        )

        const progress = Math.round(((b + 1) / totalBatches) * 100)
        setImportProgress(progress)
      }

      setImportResult(aggregated)
      setStep('results')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Невідома помилка'
      setImportError(`Помилка імпорту: ${message}`)
      setStep('results')
    }
  }

  // ── Validation stats ────────────────────────────────────────────────────────
  const validationStats = React.useMemo(() => {
    if (!parsedData) return null
    let errorCount = 0
    let barcodeCount = 0
    let autoBarcodeCount = 0
    const barcodeCol = Object.entries(mapping).find(([, v]) => v === 'barcode')?.[0]
    for (const row of parsedData.rows) {
      const v = validateRow(row, mapping)
      if (v.hasError) errorCount++
      if (barcodeCol && row[barcodeCol]?.trim()) {
        barcodeCount++
      } else {
        autoBarcodeCount++
      }
    }
    return {
      total: parsedData.rows.length,
      errorCount,
      barcodeCount,
      autoBarcodeCount,
    }
  }, [parsedData, mapping])

  if (!open) return null

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 820,
          maxHeight: '85vh',
          background: COLORS.bgCard,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: `1px solid ${COLORS.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              id="csv-import-modal-title"
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: COLORS.textPrimary,
                lineHeight: 1.2,
              }}
            >
              Імпорт товарів з CSV
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.textSecondary }}>
              Завантажте файл CSV з даними товарів
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setShowTemplateBuilder((v) => !v)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 7,
                  border: `1px solid ${showTemplateBuilder ? COLORS.sea400 : COLORS.border}`,
                  background: showTemplateBuilder ? `${COLORS.sea400}15` : 'transparent',
                  color: showTemplateBuilder ? COLORS.sea600 : COLORS.textSecondary,
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                title="Завантажити шаблон CSV"
              >
                <IconDownload size={14} />
                Шаблон CSV
              </button>

              {/* Template Builder Popover */}
              {showTemplateBuilder && (
                <TemplateBuilderPopover
                  selectedColumns={templateColumns}
                  includeExample={templateIncludeExample}
                  delimiter={delimiter}
                  onColumnsChange={setTemplateColumns}
                  onIncludeExampleChange={setTemplateIncludeExample}
                  onDownload={() => {
                    downloadTemplate(templateColumns, templateIncludeExample, delimiter)
                    setShowTemplateBuilder(false)
                  }}
                  onClose={() => setShowTemplateBuilder(false)}
                />
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрити"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 7,
                border: `1px solid ${COLORS.border}`,
                background: 'transparent',
                cursor: 'pointer',
                color: COLORS.textSecondary,
              }}
            >
              <IconClose size={17} />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Only show stepper on upload/preview */}
          {(step === 'upload' || step === 'preview') && <StepIndicator current={step} />}
          {(step === 'importing' || step === 'results') && (
            <StepIndicator current={step === 'results' ? 'importing' : step} />
          )}

          {/* ── STEP 1: Upload ─────────────────────────────────────────── */}
          {step === 'upload' && (
            <UploadStep
              isDragging={isDragging}
              delimiter={delimiter}
              fileName={fileName}
              importError={importError}
              fileInputRef={fileInputRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onFileChange={handleFileChange}
              onDelimiterChange={setDelimiter}
              onBrowseClick={() => fileInputRef.current?.click()}
            />
          )}

          {/* ── STEP 2: Preview & Mapping ──────────────────────────────── */}
          {step === 'preview' && parsedData && (
            <PreviewStep
              parsedData={parsedData}
              mapping={mapping}
              validationStats={validationStats}
              onMappingChange={(col, field) =>
                setMapping((prev) => ({ ...prev, [col]: field }))
              }
              presets={presets}
              delimiter={delimiter}
              onPresetLoad={(preset) => {
                setMapping(preset.mapping)
                setDelimiter(preset.delimiter)
              }}
              onPresetSave={(name) => {
                const newPreset: MappingPreset = { name, mapping, delimiter }
                const updated = [...presets.filter((p) => p.name !== name), newPreset]
                setPresets(updated)
                savePresets(updated)
              }}
              onPresetDelete={(name) => {
                const updated = presets.filter((p) => p.name !== name)
                setPresets(updated)
                savePresets(updated)
              }}
            />
          )}

          {/* ── STEP 3: Importing ──────────────────────────────────────── */}
          {step === 'importing' && (
            <ImportingStep
              progress={importProgress}
              total={parsedData?.rows.length ?? 0}
            />
          )}

          {/* ── STEP 4: Results ───────────────────────────────────────── */}
          {step === 'results' && (
            <ResultsStep
              result={importResult}
              importError={importError}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: `1px solid ${COLORS.border}`,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            flexShrink: 0,
          }}
        >
          {step === 'upload' && (
            <button
              type="button"
              onClick={onClose}
              style={secondaryBtnStyle}
            >
              Скасувати
            </button>
          )}

          {step === 'preview' && (
            <>
              <button
                type="button"
                onClick={() => setStep('upload')}
                style={secondaryBtnStyle}
              >
                Назад
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={
                  !validationStats ||
                  validationStats.total === 0 ||
                  validationStats.errorCount === validationStats.total
                }
                style={{
                  ...primaryBtnStyle,
                  opacity:
                    !validationStats ||
                    validationStats.total === 0 ||
                    validationStats.errorCount === validationStats.total
                      ? 0.5
                      : 1,
                  cursor:
                    !validationStats ||
                    validationStats.total === 0 ||
                    validationStats.errorCount === validationStats.total
                      ? 'not-allowed'
                      : 'pointer',
                }}
              >
                Імпортувати
                {validationStats && validationStats.total > 0 && (
                  <span
                    style={{
                      marginLeft: 6,
                      background: 'rgba(255,255,255,0.25)',
                      borderRadius: 10,
                      padding: '1px 7px',
                      fontSize: 12,
                    }}
                  >
                    {validationStats.total - validationStats.errorCount}
                  </span>
                )}
              </button>
            </>
          )}

          {step === 'results' && (
            <button
              type="button"
              onClick={() => {
                onClose()
                onImportComplete()
              }}
              style={primaryBtnStyle}
            >
              Закрити
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Button styles ────────────────────────────────────────────────────────────

const secondaryBtnStyle: React.CSSProperties = {
  padding: '9px 20px',
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  background: 'transparent',
  color: COLORS.textSecondary,
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
}

const primaryBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 22px',
  borderRadius: 8,
  border: 'none',
  background: COLORS.sea500,
  color: '#fff',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

// ─── Template Builder Popover ─────────────────────────────────────────────────

interface TemplateBuilderPopoverProps {
  selectedColumns: string[]
  includeExample: boolean
  delimiter: ';' | ','
  onColumnsChange: (cols: string[]) => void
  onIncludeExampleChange: (v: boolean) => void
  onDownload: () => void
  onClose: () => void
}

function TemplateBuilderPopover({
  selectedColumns, includeExample, delimiter,
  onColumnsChange, onIncludeExampleChange, onDownload, onClose,
}: TemplateBuilderPopoverProps) {
  const toggleColumn = (key: string) => {
    const required: string[] = TEMPLATE_COLUMNS.filter((c) => c.required).map((c) => c.key)
    if (required.includes(key)) return
    if (selectedColumns.includes(key)) {
      onColumnsChange(selectedColumns.filter((k) => k !== key))
    } else {
      onColumnsChange([...selectedColumns, key])
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 10000 }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 6,
          width: 360,
          maxHeight: 480,
          background: COLORS.bgCard,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          zIndex: 10001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '14px 16px 10px',
          borderBottom: `1px solid ${COLORS.border}`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.textPrimary }}>
            Конструктор шаблону
          </div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
            Оберіть колонки для CSV-шаблону
          </div>
        </div>

        {/* Columns list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {TEMPLATE_COLUMNS.map((col) => {
            const isSelected = selectedColumns.includes(col.key)
            const isRequired = col.required
            return (
              <label
                key={col.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '7px 16px',
                  cursor: isRequired ? 'default' : 'pointer',
                  fontSize: 13,
                  color: isSelected ? COLORS.textPrimary : COLORS.textMuted,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { if (!isRequired) e.currentTarget.style.background = COLORS.bgPrimary }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={isRequired}
                  onChange={() => toggleColumn(col.key)}
                  style={{ accentColor: COLORS.sea500, width: 15, height: 15, cursor: isRequired ? 'default' : 'pointer' }}
                />
                <span style={{ flex: 1 }}>
                  <span style={{ fontWeight: isSelected ? 600 : 400 }}>{col.label}</span>
                  {isRequired && (
                    <span style={{ fontSize: 10, color: COLORS.sea600, marginLeft: 6, fontWeight: 700 }}>
                      *
                    </span>
                  )}
                </span>
                <span style={{
                  fontSize: 11,
                  color: COLORS.textMuted,
                  fontFamily: 'monospace',
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {col.example}
                </span>
              </label>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid ${COLORS.border}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: COLORS.textSecondary,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={includeExample}
              onChange={(e) => onIncludeExampleChange(e.target.checked)}
              style={{ accentColor: COLORS.sea500, width: 15, height: 15, cursor: 'pointer' }}
            />
            Додати рядок-приклад
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => onColumnsChange(TEMPLATE_COLUMNS.map((c) => c.key))}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 6,
                border: `1px solid ${COLORS.border}`,
                background: 'transparent',
                color: COLORS.textSecondary,
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Обрати всі
            </button>
            <button
              type="button"
              onClick={onDownload}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 6,
                border: 'none',
                background: COLORS.sea500,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Завантажити ({selectedColumns.length} кол., {delimiter})
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface UploadStepProps {
  isDragging: boolean
  delimiter: ';' | ','
  fileName: string
  importError: string
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onDragEnter: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onDelimiterChange: (d: ';' | ',') => void
  onBrowseClick: () => void
}

function UploadStep({
  isDragging,
  delimiter,
  fileName,
  importError,
  fileInputRef,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
  onDelimiterChange,
  onBrowseClick,
}: UploadStepProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Drop zone */}
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={onBrowseClick}
        role="button"
        tabIndex={0}
        aria-label="Зона завантаження CSV файлу"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onBrowseClick()
        }}
        style={{
          border: `2px dashed ${isDragging ? COLORS.sea500 : COLORS.border}`,
          borderRadius: 12,
          padding: '48px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          cursor: 'pointer',
          background: isDragging ? `${COLORS.sea400}10` : COLORS.bgPrimary,
          transition: 'border-color 0.2s, background 0.2s',
          outline: 'none',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: `${COLORS.sea400}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconUpload size={36} color={COLORS.sea500} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              color: COLORS.textPrimary,
            }}
          >
            Перетягніть CSV файл сюди
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.textSecondary }}>
            або{' '}
            <span style={{ color: COLORS.sea500, fontWeight: 500 }}>виберіть файл</span>
          </p>
        </div>
        {fileName && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 6,
              background: `${COLORS.sea400}22`,
              color: COLORS.sea600,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            <IconFile size={14} color={COLORS.sea600} />
            {fileName}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={onFileChange}
          aria-label="Вибір CSV файлу"
        />
      </div>

      {/* Delimiter selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.bgPrimary,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: COLORS.textSecondary, minWidth: 120 }}>
          Роздільник стовпців:
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {([';', ','] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelimiterChange(d)
              }}
              style={{
                padding: '5px 16px',
                borderRadius: 6,
                border: `1.5px solid ${delimiter === d ? COLORS.sea500 : COLORS.border}`,
                background: delimiter === d ? `${COLORS.sea400}20` : 'transparent',
                color: delimiter === d ? COLORS.sea600 : COLORS.textSecondary,
                fontSize: 14,
                fontWeight: delimiter === d ? 700 : 400,
                cursor: 'pointer',
                fontFamily: 'monospace',
                transition: 'all 0.15s',
              }}
              aria-pressed={delimiter === d}
            >
              {d === ';' ? '; (крапка з комою)' : ', (кома)'}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {importError && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid #fca5a5`,
            background: '#fff1f2',
            color: '#b91c1c',
            fontSize: 13,
          }}
        >
          <IconWarning size={15} color="#b91c1c" />
          {importError}
        </div>
      )}

      {/* Hint */}
      <div
        style={{
          fontSize: 12,
          color: COLORS.textMuted,
          padding: '0 4px',
          lineHeight: 1.6,
        }}
      >
        Підтримуються файли .csv з кодуванням UTF-8. Перший рядок файлу повинен містити назви стовпців.
        Використовуйте кнопку «Шаблон CSV» щоб завантажити зразок файлу з правильними заголовками.
      </div>
    </div>
  )
}

// ─── Preview Step ─────────────────────────────────────────────────────────────

interface PreviewStepProps {
  parsedData: ParsedData
  mapping: Record<string, string>
  validationStats: {
    total: number
    errorCount: number
    barcodeCount: number
    autoBarcodeCount: number
  } | null
  onMappingChange: (col: string, field: string) => void
  presets: MappingPreset[]
  delimiter: ';' | ','
  onPresetLoad: (preset: MappingPreset) => void
  onPresetSave: (name: string) => void
  onPresetDelete: (name: string) => void
}

function PreviewStep({
  parsedData, mapping, validationStats, onMappingChange,
  presets, delimiter: _delimiter, onPresetLoad, onPresetSave, onPresetDelete,
}: PreviewStepProps) {
  const previewRows = parsedData.rows.slice(0, 5)
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Validation stats */}
      {validationStats && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}
        >
          <StatBadge
            label="Всього рядків"
            value={validationStats.total}
            color={COLORS.textPrimary}
            bg={COLORS.bgPrimary}
          />
          <StatBadge
            label="З помилками"
            value={validationStats.errorCount}
            color={validationStats.errorCount > 0 ? '#b91c1c' : COLORS.textMuted}
            bg={validationStats.errorCount > 0 ? '#fff1f2' : COLORS.bgPrimary}
          />
          <StatBadge
            label="Є штрих-код"
            value={validationStats.barcodeCount}
            color={COLORS.sea600}
            bg={`${COLORS.sea400}15`}
          />
          <StatBadge
            label="Авто штрих-код"
            value={validationStats.autoBarcodeCount}
            color={COLORS.textSecondary}
            bg={COLORS.bgPrimary}
          />
        </div>
      )}

      {/* ── Preset Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 14px',
          borderRadius: 8,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.bgPrimary,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, whiteSpace: 'nowrap' }}>
          Збережені маппінги:
        </span>
        {presets.length > 0 ? (
          <select
            value={selectedPreset}
            onChange={(e) => {
              const name = e.target.value
              setSelectedPreset(name)
              const preset = presets.find((p) => p.name === name)
              if (preset) onPresetLoad(preset)
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.bgCard,
              fontSize: 12,
              color: COLORS.textPrimary,
              cursor: 'pointer',
              outline: 'none',
              minWidth: 140,
            }}
          >
            <option value="">Оберіть пресет...</option>
            {presets.map((p) => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        ) : (
          <span style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' }}>немає збережених</span>
        )}

        {selectedPreset && (
          <button
            type="button"
            onClick={() => {
              onPresetDelete(selectedPreset)
              setSelectedPreset('')
            }}
            style={{
              padding: '4px 10px',
              borderRadius: 5,
              border: 'none',
              background: 'rgba(239,68,68,0.08)',
              color: '#dc2626',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Видалити
          </button>
        )}

        <div style={{ flex: 1 }} />

        {showSavePreset ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Назва (напр. Elgon)"
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: `1px solid ${COLORS.sea400}`,
                fontSize: 12,
                color: COLORS.textPrimary,
                outline: 'none',
                width: 150,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && presetName.trim()) {
                  onPresetSave(presetName.trim())
                  setPresetName('')
                  setShowSavePreset(false)
                  setSelectedPreset(presetName.trim())
                }
              }}
              autoFocus
            />
            <button
              type="button"
              onClick={() => {
                if (presetName.trim()) {
                  onPresetSave(presetName.trim())
                  setSelectedPreset(presetName.trim())
                  setPresetName('')
                  setShowSavePreset(false)
                }
              }}
              disabled={!presetName.trim()}
              style={{
                padding: '5px 12px',
                borderRadius: 5,
                border: 'none',
                background: presetName.trim() ? COLORS.sea500 : COLORS.border,
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                cursor: presetName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              OK
            </button>
            <button
              type="button"
              onClick={() => { setShowSavePreset(false); setPresetName('') }}
              style={{
                padding: '5px 8px',
                borderRadius: 5,
                border: `1px solid ${COLORS.border}`,
                background: 'transparent',
                color: COLORS.textMuted,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              Скасувати
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSavePreset(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 6,
              border: `1px solid ${COLORS.sea400}`,
              background: `${COLORS.sea400}12`,
              color: COLORS.sea600,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
            </svg>
            Зберегти маппінг
          </button>
        )}
      </div>

      {/* Column mapping */}
      <div>
        <h3
          style={{
            margin: '0 0 10px',
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.textPrimary,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Прив&apos;язка стовпців CSV
        </h3>
        <div
          style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: COLORS.bgPrimary }}>
                <th
                  style={{
                    padding: '9px 14px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: COLORS.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: `1px solid ${COLORS.border}`,
                    width: '40%',
                  }}
                >
                  Стовпець у файлі
                </th>
                <th
                  style={{
                    padding: '9px 14px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: COLORS.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    borderBottom: `1px solid ${COLORS.border}`,
                  }}
                >
                  Поле товару
                </th>
              </tr>
            </thead>
            <tbody>
              {parsedData.headers.map((header, idx) => (
                <tr
                  key={header}
                  style={{
                    background: idx % 2 === 0 ? COLORS.bgCard : COLORS.bgPrimary,
                  }}
                >
                  <td
                    style={{
                      padding: '8px 14px',
                      fontSize: 13,
                      color: COLORS.textPrimary,
                      fontFamily: 'monospace',
                      borderBottom:
                        idx < parsedData.headers.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                    }}
                  >
                    {header}
                  </td>
                  <td
                    style={{
                      padding: '6px 14px',
                      borderBottom:
                        idx < parsedData.headers.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                    }}
                  >
                    <select
                      value={mapping[header] || ''}
                      onChange={(e) => onMappingChange(header, e.target.value)}
                      aria-label={`Поле для стовпця "${header}"`}
                      style={{
                        width: '100%',
                        padding: '5px 8px',
                        borderRadius: 6,
                        border: `1px solid ${mapping[header] ? COLORS.sea400 : COLORS.border}`,
                        background: COLORS.bgCard,
                        color: mapping[header] ? COLORS.sea600 : COLORS.textSecondary,
                        fontSize: 13,
                        fontWeight: mapping[header] ? 500 : 400,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      {PRODUCT_FIELDS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview table */}
      <div>
        <h3
          style={{
            margin: '0 0 10px',
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.textPrimary,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Перші {previewRows.length} рядки
        </h3>
        <div
          style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr style={{ background: COLORS.bgPrimary }}>
                <th
                  style={{
                    padding: '8px 10px',
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: COLORS.textMuted,
                    borderBottom: `1px solid ${COLORS.border}`,
                    width: 36,
                  }}
                >
                  #
                </th>
                {parsedData.headers.map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '8px 10px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      color: COLORS.textMuted,
                      borderBottom: `1px solid ${COLORS.border}`,
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {h}
                  </th>
                ))}
                <th
                  style={{
                    padding: '8px 10px',
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: COLORS.textMuted,
                    borderBottom: `1px solid ${COLORS.border}`,
                    width: 36,
                  }}
                >
                  OK
                </th>
              </tr>
            </thead>
            <tbody>
              {previewRows.map((row, idx) => {
                const validation = validateRow(row, mapping)
                return (
                  <tr
                    key={idx}
                    style={{
                      background: validation.hasError
                        ? '#fff8f8'
                        : idx % 2 === 0
                          ? COLORS.bgCard
                          : COLORS.bgPrimary,
                    }}
                  >
                    <td
                      style={{
                        padding: '7px 10px',
                        textAlign: 'center',
                        fontSize: 12,
                        color: COLORS.textMuted,
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {idx + 1}
                    </td>
                    {parsedData.headers.map((h) => (
                      <td
                        key={h}
                        title={row[h] || ''}
                        style={{
                          padding: '7px 10px',
                          fontSize: 12,
                          color: COLORS.textPrimary,
                          borderBottom: `1px solid ${COLORS.border}`,
                          maxWidth: 140,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {row[h] || (
                          <span style={{ color: COLORS.textMuted }}>—</span>
                        )}
                      </td>
                    ))}
                    <td
                      style={{
                        padding: '7px 10px',
                        textAlign: 'center',
                        borderBottom: `1px solid ${COLORS.border}`,
                      }}
                    >
                      {validation.hasError ? (
                        <span title={validation.errorMessage}>
                          <IconWarning size={14} color="#ef4444" />
                        </span>
                      ) : (
                        <IconCheck size={14} color="#22c55e" />
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {parsedData.rows.length > 5 && (
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 12,
              color: COLORS.textMuted,
            }}
          >
            ...та ще {parsedData.rows.length - 5} рядків
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Stat Badge ───────────────────────────────────────────────────────────────

function StatBadge({
  label,
  value,
  color,
  bg,
}: {
  label: string
  value: number
  color: string
  bg: string
}) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 8,
        border: `1px solid ${COLORS.border}`,
        background: bg,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: 700,
          color,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 500 }}>{label}</span>
    </div>
  )
}

// ─── Importing Step ───────────────────────────────────────────────────────────

function ImportingStep({ progress, total }: { progress: number; total: number }) {
  const processed = Math.round((progress / 100) * total)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
        gap: 24,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: `${COLORS.sea400}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        <IconUpload size={32} color={COLORS.sea500} />
      </div>

      <div style={{ textAlign: 'center' }}>
        <p
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: COLORS.textPrimary,
          }}
        >
          Імпортуємо товари...
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.textSecondary }}>
          Оброблено {processed} з {total} рядків
        </p>
      </div>

      {/* Progress bar */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          height: 10,
          borderRadius: 99,
          background: COLORS.border,
          overflow: 'hidden',
        }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Прогрес імпорту"
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            borderRadius: 99,
            background: `linear-gradient(90deg, ${COLORS.sea400}, ${COLORS.sea600})`,
            transition: 'width 0.3s ease',
          }}
        />
      </div>

      <span
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.sea600,
        }}
      >
        {progress}%
      </span>
    </div>
  )
}

// ─── Results Step ─────────────────────────────────────────────────────────────

function ResultsStep({
  result,
  importError,
}: {
  result: ImportResult | null
  importError: string
}) {
  if (importError && !result) {
    return (
      <div
        role="alert"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          padding: '40px 0',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: '#fff1f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconWarning size={28} color="#ef4444" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.textPrimary }}>
            Помилка імпорту
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#b91c1c' }}>{importError}</p>
        </div>
      </div>
    )
  }

  if (!result) return null

  const hasErrors = result.errors.length > 0
  const allFailed = result.created === 0 && result.updated === 0 && hasErrors

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Summary */}
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: allFailed ? '#fff1f2' : `${COLORS.sea400}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
          }}
        >
          {allFailed ? (
            <IconWarning size={28} color="#ef4444" />
          ) : (
            <IconCheck size={28} color={COLORS.sea600} />
          )}
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 700,
            color: COLORS.textPrimary,
          }}
        >
          {allFailed ? 'Імпорт завершився з помилками' : 'Імпорт завершено'}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: COLORS.textSecondary }}>
          Всього оброблено рядків: {result.total}
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <StatBadge
          label="Створено"
          value={result.created}
          color={COLORS.sea600}
          bg={`${COLORS.sea400}15`}
        />
        <StatBadge
          label="Оновлено"
          value={result.updated}
          color="#2563eb"
          bg="#eff6ff"
        />
        <StatBadge
          label="Помилок"
          value={result.errors.length}
          color={result.errors.length > 0 ? '#b91c1c' : COLORS.textMuted}
          bg={result.errors.length > 0 ? '#fff1f2' : COLORS.bgPrimary}
        />
      </div>

      {/* Error list */}
      {result.errors.length > 0 && (
        <div>
          <h3
            style={{
              margin: '0 0 8px',
              fontSize: 13,
              fontWeight: 600,
              color: '#b91c1c',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Деталі помилок ({result.errors.length})
          </h3>
          <div
            style={{
              border: `1px solid #fca5a5`,
              borderRadius: 8,
              overflow: 'hidden',
              maxHeight: 220,
              overflowY: 'auto',
            }}
          >
            {result.errors.map((err, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '9px 12px',
                  background: idx % 2 === 0 ? '#fff' : '#fff8f8',
                  borderBottom:
                    idx < result.errors.length - 1 ? `1px solid #fecaca` : 'none',
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: '#fee2e2',
                    color: '#b91c1c',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                >
                  Р. {err.row}
                </span>
                <span style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.5 }}>
                  {err.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
