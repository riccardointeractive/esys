'use client'

import { Phone, MessageCircle } from 'lucide-react'

interface StickyMobileBarProps {
  contactLabel: string
  price: string
}

export function StickyMobileBar({ contactLabel, price }: StickyMobileBarProps) {
  return (
    <div className="vip-mobile-bar">
      <div className="vip-mobile-bar__price">
        <span className="font-display ds-font-bold">{price}</span>
      </div>
      <div className="vip-mobile-bar__actions">
        <button type="button" className="ds-btn ds-btn--outline ds-btn--sm vip-mobile-bar__btn">
          <Phone size={16} />
        </button>
        <button type="button" className="ds-btn ds-btn--sm vip-mobile-bar__btn">
          <MessageCircle size={16} />
          <span>{contactLabel}</span>
        </button>
      </div>
    </div>
  )
}
