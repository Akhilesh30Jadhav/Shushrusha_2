import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const sessions = await prisma.session.findMany({
            orderBy: { started_at: 'desc' },
            take: limit,
            include: {
                scenario: {
                    select: { title: true, category: true }
                }
            }
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Error fetching session history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
