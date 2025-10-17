import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { Favorite } from '@/lib/types'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ favorites: data as Favorite[] })
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { asset_id } = await request.json()

    if (!asset_id) {
      return NextResponse.json(
        { error: 'asset_id is required' },
        { status: 400 }
      )
    }

    // Try to insert, ignore if already exists
    const { data, error } = await supabase
      .from('favorites')
      .insert({ asset_id })
      .select()
      .single()

    // Handle duplicate entry (unique constraint violation)
    if (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation code
        return NextResponse.json(
          { message: 'Asset already in favorites' },
          { status: 200 }
        )
      }
      throw error
    }

    return NextResponse.json({ favorite: data }, { status: 201 })
  } catch (error) {
    console.error('Error adding favorite:', error)
    return NextResponse.json(
      { error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const asset_id = searchParams.get('asset_id')

    if (!asset_id) {
      return NextResponse.json(
        { error: 'asset_id is required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('asset_id', asset_id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Favorite removed successfully' })
  } catch (error) {
    console.error('Error removing favorite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
