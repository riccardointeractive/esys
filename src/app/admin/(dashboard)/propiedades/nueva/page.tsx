import { PropertyForm } from '@/components/admin/PropertyForm'
import { getAllDefinitions } from '@/lib/definitions'

export default async function AdminPropertyNewPage() {
  const definitions = await getAllDefinitions()
  return <PropertyForm definitions={definitions} />
}
