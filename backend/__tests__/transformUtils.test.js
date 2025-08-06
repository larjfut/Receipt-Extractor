const {
  currencyToFloat,
  dateToISO,
  extractLineItems,
  applyTransformations
} = require('../transformUtils')

describe('currencyToFloat', () => {
  test('parses currency formatted strings', () => {
    expect(currencyToFloat('$1,234.56')).toBeCloseTo(1234.56)
    expect(currencyToFloat('€987,654')).toBe(987654)
  })
})

describe('dateToISO', () => {
  test('normalizes common date formats', () => {
    expect(dateToISO('08/06/2025')).toBe('2025-08-06')
    expect(dateToISO('2025-08-06')).toBe('2025-08-06')
    expect(dateToISO('Aug 6, 2025')).toBe('2025-08-06')
  })
})

describe('extractLineItems', () => {
  test('extracts rows from tables and applies transformations', () => {
    const tables = [
      {
        rowCount: 3,
        columnCount: 3,
        cells: [
          { rowIndex: 0, columnIndex: 0, content: 'Date' },
          { rowIndex: 0, columnIndex: 1, content: 'Item Description' },
          { rowIndex: 0, columnIndex: 2, content: 'Total' },
          { rowIndex: 1, columnIndex: 0, content: '08/06/2025' },
          { rowIndex: 1, columnIndex: 1, content: 'Item A' },
          { rowIndex: 1, columnIndex: 2, content: '$10.00' },
          { rowIndex: 2, columnIndex: 0, content: '08/07/2025' },
          { rowIndex: 2, columnIndex: 1, content: 'Item B' },
          { rowIndex: 2, columnIndex: 2, content: '$20.00' }
        ]
      }
    ]

    const mapping = {
      columns: [
        { name: 'Date', transformation: 'dateToISO' },
        { name: 'Item Description' },
        { name: 'Total', transformation: 'currencyToFloat' }
      ]
    }

    const items = extractLineItems(tables, mapping)
    expect(items).toEqual([
      { Date: '2025-08-06', 'Item Description': 'Item A', Total: 10 },
      { Date: '2025-08-07', 'Item Description': 'Item B', Total: 20 }
    ])
  })
})

describe('applyTransformations', () => {
  test('applies transformations based on mapping', () => {
    const fieldMap = [
      { stateKey: 'amount', transformation: 'currencyToFloat' },
      { stateKey: 'when', transformation: 'dateToISO' }
    ]
    const data = { amount: '$1,234.50', when: 'Aug 6, 2025' }
    expect(applyTransformations(fieldMap, data)).toEqual({
      amount: 1234.5,
      when: '2025-08-06'
    })
  })
})

