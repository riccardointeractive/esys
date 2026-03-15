'use client'

import { useState, useMemo } from 'react'

interface MortgageCalculatorProps {
  price: number
  locale: string
}

export function MortgageCalculator({ price, locale }: MortgageCalculatorProps) {
  const [years, setYears] = useState(25)
  const [rate, setRate] = useState(3.5)
  const [downPaymentPct, setDownPaymentPct] = useState(20)

  const monthlyPayment = useMemo(() => {
    const principal = price * (1 - downPaymentPct / 100)
    const monthlyRate = rate / 100 / 12
    const numPayments = years * 12
    if (monthlyRate === 0) return principal / numPayments
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1)
  }, [price, years, rate, downPaymentPct])

  const fmt = (n: number) =>
    new Intl.NumberFormat(locale === 'es' ? 'es-ES' : locale === 'ru' ? 'ru-RU' : 'en-GB', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(n)

  return (
    <div className="ds-card">
      <div className="ds-card__body">
        <h2 className="ds-text-lg ds-font-semibold ds-text-primary ds-mb-4">
          Calculadora hipotecaria
        </h2>

        <div className="ds-flex ds-flex-col ds-gap-4">
          {/* Down Payment */}
          <div>
            <label className="ds-text-sm ds-text-secondary ds-mb-1" style={{ display: 'block' }}>
              Entrada ({downPaymentPct}%)
            </label>
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(Number(e.target.value))}
              className="vip-mortgage__slider"
            />
            <div className="ds-flex ds-justify-between ds-text-xs ds-text-tertiary">
              <span>{fmt(price * downPaymentPct / 100)}</span>
              <span>Financiado: {fmt(price * (1 - downPaymentPct / 100))}</span>
            </div>
          </div>

          {/* Years */}
          <div>
            <label className="ds-text-sm ds-text-secondary ds-mb-1" style={{ display: 'block' }}>
              Plazo: {years} años
            </label>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="vip-mortgage__slider"
            />
          </div>

          {/* Rate */}
          <div>
            <label className="ds-text-sm ds-text-secondary ds-mb-1" style={{ display: 'block' }}>
              Tipo de interés: {rate.toFixed(1)}%
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={0.1}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="vip-mortgage__slider"
            />
          </div>

          {/* Result */}
          <div className="vip-mortgage__result">
            <span className="ds-text-sm ds-text-secondary">Cuota mensual estimada</span>
            <span className="font-display ds-text-2xl ds-font-bold ds-text-primary">
              {fmt(monthlyPayment)}/mes
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
