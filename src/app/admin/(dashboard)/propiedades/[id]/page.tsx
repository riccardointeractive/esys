import { PropertyForm } from '@/components/admin/PropertyForm'
import { getAllDefinitions } from '@/lib/definitions'
import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import type { PropertyWithRelations } from '@/types/property'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminPropertyEditPage({ params }: Props) {
  const { id } = await params
  const [definitions, property] = await Promise.all([
    getAllDefinitions(),
    fetchProperty(id),
  ])

  if (!property) {
    return (
      <div className="ds-alert ds-alert--error">
        Propiedad no encontrada
      </div>
    )
  }

  return <PropertyForm property={property} definitions={definitions} />
}

async function fetchProperty(id: string): Promise<PropertyWithRelations | null> {
  const supabase = getAdminClient()

  const { data: property, error } = await supabase
    .from(TABLES.properties)
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (error || !property) return null

  const [{ data: images }, { data: features }] = await Promise.all([
    supabase
      .from(TABLES.propertyImages)
      .select('*')
      .eq('property_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from(TABLES.propertyFeatures)
      .select('*')
      .eq('property_id', id),
  ])

  return {
    ...property,
    images: images ?? [],
    features: features ?? [],
  } as PropertyWithRelations
}
