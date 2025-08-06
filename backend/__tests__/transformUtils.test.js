const {
  currencyToFloat,
  dateToISO,
  extractLineItems,
} = require('../transformUtils')

describe('currencyToFloat', () => {
  it('parses formatted currency strings', () => {
    expect(currencyToFloat('$1,234.56')).toBeCloseTo(1234.56)
    expect(currencyToFloat('€987,654')).toBe(987654)
  })

  it('returns null for non-numeric input', () => {
    expect(currencyToFloat('abc')).toBeNull()
  })
})

describe('dateToISO', () => {
  it('normalizes common date formats', () => {
    expect(dateToISO('08/06/2025')).toBe('2025-08-06')
    expect(dateToISO('Aug 6, 2025')).toBe('2025-08-06')
    expect(dateToISO('2025-08-06')).toBe('2025-08-06')
  })
})

describe('extractLineItems', () => {
  it('extracts rows and applies transformations', () => {
    const tables = [
      {
        rowCount: 2,
        columnCount: 3,
        cells: [
          { rowIndex: 0, columnIndex: 0, content: 'Date' },
          { rowIndex: 0, columnIndex: 1, content: 'Item' },
          { rowIndex: 0, columnIndex: 2, content: 'Total' },
          { rowIndex: 1, columnIndex: 0, content: '08/06/2025' },
          { rowIndex: 1, columnIndex: 1, content: 'Item A' },
          { rowIndex: 1, columnIndex: 2, content: '$10.00' },
        ],
      },
    ]
    const mapping = {
      columns: [
        { name: 'Date', transformation: 'dateToISO' },
        { name: 'Item' },
        { name: 'Total', transformation: 'currencyToFloat' },
      ],
    }
    expect(extractLineItems(tables, mapping)).toEqual([
      { Date: '2025-08-06', Item: 'Item A', Total: 10 },
    ])
  })
})
