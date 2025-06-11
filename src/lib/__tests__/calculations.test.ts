import { describe, it, expect } from 'vitest'
import { calculateStats, prepareProfitChartData, prepareCumulativeProfitChartData } from '../calculations'
import type { BetEntry } from '../types'

const baseEntry = { id: '', raceName: undefined }

function makeEntry(id: string, date: string, bet: number, payout: number): BetEntry {
  return {
    id,
    date,
    betAmount: bet,
    payoutAmount: payout,
    profitLoss: payout - bet,
    roi: bet === 0 ? 0 : (payout / bet) * 100,
    ...baseEntry,
  }
}

describe('calculateStats', () => {
  it('handles empty array', () => {
    expect(calculateStats([])).toEqual({
      totalInvestment: 0,
      totalPayout: 0,
      netProfit: 0,
      overallRecoveryRate: 0,
      hitRate: 0,
      maxPayoutPerRace: 0,
    })
  })

  it('single winning entry', () => {
    const entries = [makeEntry('1', '2024-01-01', 100, 150)]
    const result = calculateStats(entries)
    expect(result.totalInvestment).toBe(100)
    expect(result.totalPayout).toBe(150)
    expect(result.netProfit).toBe(50)
    expect(result.overallRecoveryRate).toBeCloseTo(150)
    expect(result.hitRate).toBeCloseTo(100)
    expect(result.maxPayoutPerRace).toBe(150)
  })

  it('mixed entries', () => {
    const entries = [
      makeEntry('1','2024-01-01',100,150),
      makeEntry('2','2024-01-02',200,0),
      makeEntry('3','2024-01-03',50,100),
    ]
    const result = calculateStats(entries)
    expect(result.totalInvestment).toBe(350)
    expect(result.totalPayout).toBe(250)
    expect(result.netProfit).toBe(-100)
    expect(result.overallRecoveryRate).toBeCloseTo(71.428, 3)
    expect(result.hitRate).toBeCloseTo(66.666, 3)
    expect(result.maxPayoutPerRace).toBe(150)
  })
})

describe('prepareProfitChartData', () => {
  const entries = [
    makeEntry('1','2024-01-01',100,110),
    makeEntry('2','2024-01-01',50,45),
    makeEntry('3','2024-01-02',100,120),
  ]

  it('returns empty array for no data', () => {
    expect(prepareProfitChartData([], 'daily')).toEqual([])
  })

  it('aggregates daily', () => {
    expect(prepareProfitChartData(entries, 'daily')).toEqual([
      { name: '2024-01-01', value: 5 },
      { name: '2024-01-02', value: 20 },
    ])
  })

  it('aggregates weekly', () => {
    expect(prepareProfitChartData(entries, 'weekly')).toEqual([
      { name: '2024-W01', value: 25 },
    ])
  })

  it('aggregates monthly', () => {
    expect(prepareProfitChartData(entries, 'monthly')).toEqual([
      { name: '2024-01', value: 25 },
    ])
  })
})

describe('prepareCumulativeProfitChartData', () => {
  const entries = [
    makeEntry('1','2024-01-01',100,110),
    makeEntry('2','2024-01-03',50,45),
    makeEntry('3','2024-01-05',50,65),
  ]

  it('returns empty array for no data', () => {
    expect(prepareCumulativeProfitChartData([], 'daily')).toEqual([])
  })

  it('handles single entry', () => {
    const single = [makeEntry('s','2024-02-01',100,50)]
    expect(prepareCumulativeProfitChartData(single, 'daily')).toEqual([
      { name: '2024-02-01', value: -50 },
    ])
  })

  it('computes cumulative daily data', () => {
    expect(prepareCumulativeProfitChartData(entries, 'daily')).toEqual([
      { name: '2024-01-01', value: 10 },
      { name: '2024-01-02', value: 10 },
      { name: '2024-01-03', value: 5 },
      { name: '2024-01-04', value: 5 },
      { name: '2024-01-05', value: 20 },
    ])
  })

  it('computes cumulative weekly data', () => {
    expect(prepareCumulativeProfitChartData(entries, 'weekly')).toEqual([
      { name: '2024-W01', value: 20 },
    ])
  })

  it('computes cumulative monthly data', () => {
    expect(prepareCumulativeProfitChartData(entries, 'monthly')).toEqual([
      { name: '2024-01', value: 20 },
    ])
  })
})
