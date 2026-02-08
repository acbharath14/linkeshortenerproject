import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { links } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

function generateShortCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userLinks = await db
      .select()
      .from(links)
      .where(eq(links.userId, userId));

    return NextResponse.json(userLinks);
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { originalUrl, title, description } = await request.json();

    if (!originalUrl) {
      return NextResponse.json({ error: 'Original URL is required' }, { status: 400 });
    }

    let shortCode = generateShortCode();
    let attempts = 0;
    
    // Ensure unique short code
    while (attempts < 10) {
      const existing = await db
        .select()
        .from(links)
        .where(eq(links.shortCode, shortCode));
      
      if (existing.length === 0) break;
      shortCode = generateShortCode();
      attempts++;
    }

    const newLink = await db
      .insert(links)
      .values({
        userId,
        originalUrl,
        shortCode,
        title,
        description,
      })
      .returning();

    return NextResponse.json(newLink[0], { status: 201 });
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 });
  }
}
