'use client'

import React, { useCallback, useRef, useState } from 'react'

interface CustomUploadProps {
  value?: string | { url?: string; filename?: string; mimeType?: string; filesize?: number }
  onChange?: (file: File | null) => void
  accept?: string
  maxSize?: number // MB
}

const FORMAT_TAGS: Record<string, string> = {
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'image/svg+xml': 'SVG',
  'video/mp4': 'MP4',
  'application/pdf': 'PDF',
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function CloudIcon() {
  return (
    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 16l-4-4-4 4" />
      <path d="M12 12v9" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

export default function CustomUpload({ value, onChange, accept = 'image/*', maxSize = 10 }: CustomUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<{ url: string; name: string; size: number; type: string } | null>(null)
  const [error, setError] = useState('')

  // Resolve existing value
  const existingUrl = typeof value === 'object' && value?.url ? value.url : typeof value === 'string' ? value : null
  const existingName = typeof value === 'object' && value?.filename ? value.filename : null

  const handleFile = useCallback((file: File) => {
    setError('')
    // Size check
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Файл завеликий. Максимум: ${maxSize} МБ`)
      return
    }
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreview({ url, name: file.name, size: file.size, type: file.type })
    } else {
      setPreview({ url: '', name: file.name, size: file.size, type: file.type })
    }
    onChange?.(file)
  }, [maxSize, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleRemove = useCallback(() => {
    setPreview(null)
    setError('')
    onChange?.(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [onChange])

  // File selected — show preview
  if (preview) {
    return (
      <div className="hl-upload-zone hl-upload-zone--has-file">
        <div className="hl-upload-zone__preview">
          {preview.url ? (
            <img src={preview.url} alt={preview.name} className="hl-upload-zone__preview-img" />
          ) : (
            <div className="hl-upload-zone__preview-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-base-50)' }}>
              <span style={{ fontSize: 11, color: 'var(--color-base-400)' }}>{FORMAT_TAGS[preview.type] || 'FILE'}</span>
            </div>
          )}
          <div className="hl-upload-zone__preview-info">
            <div className="hl-upload-zone__preview-name">{preview.name}</div>
            <div className="hl-upload-zone__preview-size">
              {formatFileSize(preview.size)}
              {FORMAT_TAGS[preview.type] && (
                <span style={{ marginLeft: 8, padding: '1px 6px', background: 'rgba(91,196,196,0.1)', borderRadius: 4, fontSize: 11, color: '#4a9e9e' }}>
                  {FORMAT_TAGS[preview.type]}
                </span>
              )}
            </div>
          </div>
          <button className="hl-upload-zone__preview-remove" onClick={handleRemove}>Видалити</button>
        </div>
      </div>
    )
  }

  // Existing value — show it
  if (existingUrl) {
    return (
      <div className="hl-upload-zone hl-upload-zone--has-file">
        <div className="hl-upload-zone__preview">
          <img src={existingUrl} alt={existingName || ''} className="hl-upload-zone__preview-img" />
          <div className="hl-upload-zone__preview-info">
            <div className="hl-upload-zone__preview-name">{existingName || 'Поточний файл'}</div>
          </div>
          <button className="hl-upload-zone__preview-remove" onClick={handleRemove}>Замінити</button>
        </div>
      </div>
    )
  }

  // Drop zone
  return (
    <div>
      <div
        className={`hl-upload-zone ${isDragging ? 'hl-upload-zone--active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <div className="hl-upload-zone__icon"><CloudIcon /></div>
        <div className="hl-upload-zone__text">
          Перетягніть файл сюди або <strong style={{ color: '#5bc4c4' }}>натисніть для вибору</strong>
        </div>
        <div className="hl-upload-zone__hint">
          Максимум {maxSize} МБ · JPG, PNG, WEBP, SVG, GIF, MP4
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          style={{ display: 'none' }}
        />
      </div>
      {error && (
        <div style={{ marginTop: 8, fontSize: 13, color: '#d4a5a5' }}>{error}</div>
      )}
    </div>
  )
}
