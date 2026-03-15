'use client'

import { PROPERTY_FEATURES } from '@/config/property'

interface PropertyFeatureSelectorProps {
  selected: string[]
  onChange: (features: string[]) => void
}

const featureEntries = Object.entries(PROPERTY_FEATURES)

export function PropertyFeatureSelector({ selected, onChange }: PropertyFeatureSelectorProps) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  return (
    <div className="ds-grid ds-grid-cols-2 ds-gap-3">
      {featureEntries.map(([key, label]) => (
        <label key={key} className="ds-checkbox">
          <input
            type="checkbox"
            checked={selected.includes(key)}
            onChange={() => toggle(key)}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>
  )
}
