import formatMoney from '../lib/formatMoney'

describe('formatMoney Function', () => {
  it('works with fractional currency', () => {
    expect(formatMoney(1)).toEqual('R$0.01')
    expect(formatMoney(10)).toEqual('R$0.10')
    expect(formatMoney(9)).toEqual('R$0.09')
    expect(formatMoney(44)).toEqual('R$0.44')
  })

  it('leaves cents off for whole currencies', () => {
    expect(formatMoney(5000)).toEqual('R$50')
    expect(formatMoney(100)).toEqual('R$1')
    expect(formatMoney(50000000)).toEqual('R$500,000')
  })

  it('works with whole and fractional currency', () => {
    expect(formatMoney(5012)).toEqual('R$50.12')
    expect(formatMoney(101)).toEqual('R$1.01')
    expect(formatMoney(110)).toEqual('R$1.10')
  })
})
