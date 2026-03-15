import { PropertyTable } from '@/components/admin/PropertyTable'
import { getAllDefinitions } from '@/lib/definitions'

export const dynamic = 'force-dynamic'

export default async function AdminPropertiesPage() {
  const definitions = await getAllDefinitions()
  return <PropertyTable definitions={definitions} />
}
