import { SettingsContent } from '@/components/admin/SettingsContent'
import { getAllDefinitionsAdmin } from '@/lib/definitions'

export default async function AdminSettingsPage() {
  const definitions = await getAllDefinitionsAdmin()

  return (
    <div>
      <h1 className="font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-6">
        Ajustes
      </h1>
      <SettingsContent initialDefinitions={definitions} />
    </div>
  )
}
