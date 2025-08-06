import React, { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ReceiptContext } from '../context/ReceiptContext.jsx'
import { mapContentType } from '../utils/mapContentType'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export default function ReviewPage() {
  const { receipt, setReceipt } = useContext(ReceiptContext)
  const contentType = mapContentType(receipt.contentTypeName)
  const [mapping, setMapping] = useState([])
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const resolveKey = (key, idx = 0) => key.replace('[i]', `[${idx}]`)

  useEffect(() => {
    // Fetch field mapping from backend so the form knows which fields to display.
    async function loadMapping() {
      try {
        const res = await axios.get(`${API_BASE_URL}/fields`, {
          params: { contentType },
        })
        setMapping(res.data)
      } catch (e) {
        console.error('Failed to load field mapping', e)
      }
    }
    loadMapping()
  }, [contentType])

  const handleChange = (key, value) => {
    setReceipt(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [key]: value,
      },
    }))
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev }
        delete copy[key]
        return copy
      })
    }
  }

  const validate = () => {
    const newErrors = {}
    mapping.forEach(field => {
      if (['file[]', 'dataURL'].includes(field.dataType)) return
      const resolvedKey = resolveKey(field.stateKey)
      const value = receipt.fields[resolvedKey]
      if (field.required && (value === undefined || value === '' || value === null)) {
        newErrors[resolvedKey] = `${field.label} is required`
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) navigate('/signature')
  }

  const renderInput = field => {
    const resolvedKey = resolveKey(field.stateKey)
    const value = receipt.fields[resolvedKey] || ''
    const commonProps = {
      className:
        'mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm',
      value,
      required: field.required,
      onChange: e => handleChange(resolvedKey, e.target.value),
    }
    if (field.dataType === 'date') return <input type='date' {...commonProps} />
    if (field.dataType === 'number') return <input type='number' {...commonProps} />
    if (field.dataType === 'text') return <textarea {...commonProps} />
    if (field.dataType === 'dropdown' || field.dataType === 'lookup') {
      let options = []
      if (field.validation && field.validation.trim().startsWith('[')) {
        try {
          options = JSON.parse(field.validation.replace(/'/g, '"'))
        } catch {}
      }
      return (
        <select {...commonProps}>
          <option value=''>Select...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )
    }
    return <input type='text' {...commonProps} />
  }

  return (
    <div className='max-w-4xl mx-auto py-8'>
      <h1 className='text-2xl font-bold mb-4'>Review Extracted Data</h1>
      <form>
        {mapping
          .filter(f => !['file[]', 'dataURL'].includes(f.dataType))
          .map(field => {
            const resolvedKey = resolveKey(field.stateKey)
            return (
              <div key={field.stateKey} className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  {field.label}
                  {field.required ? ' *' : ''}
                </label>
                {renderInput(field)}
                {errors[resolvedKey] && (
                  <p className='text-red-600 text-sm mt-1'>{errors[resolvedKey]}</p>
                )}
              </div>
            )
          })}
      </form>
      <button
        type='button'
        onClick={handleNext}
        className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
      >
        Continue to Signature
      </button>
    </div>
  )
}

