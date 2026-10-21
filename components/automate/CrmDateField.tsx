'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import { crmDateInputPlaceholder, crmDateInvalidHint, todayIso } from '@/lib/crm-dates'
import { formatInvoiceDate, parseFlexibleDateToIso } from '@/lib/maintenance-invoice-math'

export default function CrmDateField({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: string
  onChange: (iso: string) => void
  required?: boolean
}) {
  const id = useId()
  const pickerRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(() => formatInvoiceDate(value))
  const [invalid, setInvalid] = useState(false)

  const placeholder = useMemo(() => crmDateInputPlaceholder(), [])
  const invalidExample = useMemo(() => crmDateInvalidHint(), [])

  useEffect(() => {
    setText(formatInvoiceDate(value))
    setInvalid(false)
  }, [value])

  function commitText(raw: string) {
    const iso = parseFlexibleDateToIso(raw)
    if (!iso) {
      setInvalid(true)
      return
    }
    setInvalid(false)
    onChange(iso)
    setText(formatInvoiceDate(iso))
  }

  function openPicker() {
    const el = pickerRef.current
    if (!el) return
    if (typeof el.showPicker === 'function') {
      el.showPicker()
    } else {
      el.focus()
      el.click()
    }
  }

  return (
    <div>
      <label className="crm-label" htmlFor={id}>
        {label}
      </label>
      <div className={`crm-date-field ${invalid ? 'crm-date-field-invalid' : ''}`}>
        <Calendar className="crm-date-field-icon h-4 w-4 shrink-0" aria-hidden />
        <input
          id={id}
          type="text"
          className="crm-date-field-text"
          value={text}
          required={required}
          placeholder={placeholder}
          onChange={(e) => {
            setText(e.target.value)
            setInvalid(false)
          }}
          onBlur={(e) => commitText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commitText(text)
            }
          }}
        />
        <input
          ref={pickerRef}
          type="date"
          className="crm-date-field-native"
          value={value || todayIso()}
          tabIndex={-1}
          aria-hidden
          onChange={(e) => {
            if (e.target.value) {
              onChange(e.target.value)
              setInvalid(false)
            }
          }}
        />
        <button
          type="button"
          className="crm-date-field-picker"
          onClick={openPicker}
          aria-label={`Open calendar for ${label}`}
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1.5 text-[11px] text-platinum-600">
        On invoice: <span className="font-sans tabular-nums text-platinum-400">{formatInvoiceDate(value || todayIso())}</span>
        {invalid && (
          <span className="ml-2 text-red-300/90">Use a valid date (e.g. {invalidExample})</span>
        )}
      </p>
    </div>
  )
}
