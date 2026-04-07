import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: baskets, error } = await supabase
      .from('baskets')
      .select('*')

    if (error) {
      throw error
    }

    return NextResponse.json({ baskets })
  } catch (error) {
    console.error('Baskets fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch baskets' }, { status: 500 })
  }
}
