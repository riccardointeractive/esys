'use client'

import type { Definition } from '@/types/definition'

interface PropertyFeatureSelectorProps {
  selected: string[]
  onChange: (features: string[]) => void
  features: Definition[]
}

export function PropertyFeatureSelector({ selected, onChange, features }: PropertyFeatureSelectorProps) {
  function toggle(key: string) {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key))
    } else {
      onChange([...selected, key])
    }
  }

  return (
    <div className="ds-grid ds-grid-cols-2 ds-gap-3">
      {features.map((def) => (
        <label key={def.key} className="ds-checkbox">
          <input
            type="checkbox"
            checked={selected.includes(def.key)}
            onChange={() => toggle(def.key)}
          />
          <span>{def.label_es}</span>
        </label>
      ))}
    </div>
  )
}
