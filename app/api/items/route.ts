import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firestore';

export async function GET() {
  try {
    const snapshot = await db.collection('items').limit(10).get();

    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);

    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const docRef = await db.collection('items').add({
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        id: docRef.id,
        message: 'Item created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating item:', error);

    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}
