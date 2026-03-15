'use client'

import { useState } from 'react'
import { DEFINITION_CATEGORIES } from '@/config/property'
import { DefinitionManager } from '@/components/admin/DefinitionManager'
import { cn } from '@/lib/utils'
import type { DefinitionCategory, DefinitionsByCategory } from '@/types/definition'

const TABS: { key: DefinitionCategory; label: string }[] = [
  { key: DEFINITION_CATEGORIES.propertyType as DefinitionCategory, label: 'Tipos' },
  { key: DEFINITION_CATEGORIES.propertyStatus as DefinitionCategory, label: 'Estados' },
  { key: DEFINITION_CATEGORIES.propertyCategory as DefinitionCategory, label: 'Categorías' },
  { key: DEFINITION_CATEGORIES.propertyFeature as DefinitionCategory, label: 'Características' },
  { key: DEFINITION_CATEGORIES.energyRating as DefinitionCategory, label: 'Certificación Energética' },
  { key: DEFINITION_CATEGORIES.bedroomOption as DefinitionCategory, label: 'Habitaciones' },
  { key: DEFINITION_CATEGORIES.bathroomOption as DefinitionCategory, label: 'Baños' },
]

interface SettingsContentProps {
  initialDefinitions: DefinitionsByCategory
}

export function SettingsContent({ initialDefinitions }: SettingsContentProps) {
  const [activeTab, setActiveTab] = useState<DefinitionCategory>(TABS[0].key)

  return (
    <div>
      {/* Tabs */}
      <div className="vip-settings-tabs ds-mb-6">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'vip-settings-tab',
              activeTab === tab.key && 'vip-settings-tab--active'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active category manager */}
      <DefinitionManager
        key={activeTab}
        category={activeTab}
        initialDefinitions={initialDefinitions[activeTab] ?? []}
      />
    </div>
  )
}
