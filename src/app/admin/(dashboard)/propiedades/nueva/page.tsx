import { PropertyForm } from '@/components/admin/PropertyForm'
import { getAllDefinitions } from '@/lib/definitions'

export const dynamic = 'force-dynamic'

export default async function AdminPropertyNewPage() {
  const definitions = await getAllDefinitions()
  return <PropertyForm definitions={definitions} />
}
