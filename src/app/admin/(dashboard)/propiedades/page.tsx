import { PropertyTable } from '@/components/admin/PropertyTable'
import { getAllDefinitions } from '@/lib/definitions'

export default async function AdminPropertiesPage() {
  const definitions = await getAllDefinitions()
  return <PropertyTable definitions={definitions} />
}
