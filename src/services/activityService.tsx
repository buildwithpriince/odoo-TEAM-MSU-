import { supabase } from '../supabase'

export async function searchActivities(params: {
    search?: string
    cityId?: string
    category?: string
}) {
    let query = supabase
        .from('activities')
        .select(`
      *,
      cities (
        id,
        name,
        country
      )
    `)
        .eq('is_active', true)

    if (params.search) {
        query = query.ilike('name', `%${params.search}%`)
    }

    if (params.cityId) {
        query = query.eq('city_id', params.cityId)
    }

    if (params.category) {
        query = query.eq('category', params.category)
    }

    const { data, error } = await query.order('name')

    if (error) throw error

    return data
}