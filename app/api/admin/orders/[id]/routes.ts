import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status, trackingNumber, notes } = body

    // TODO: Mettre à jour dans la vraie base de données
    console.log('Updating order:', { id, status, trackingNumber, notes })

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully'
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}
