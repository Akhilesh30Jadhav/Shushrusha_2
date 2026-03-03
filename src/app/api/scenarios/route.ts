import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const lang = searchParams.get('lang');

        // Fetch scenarios
        const scenarios = await prisma.scenario.findMany();

        // Optionally filter by language if `lang` is provided
        const filtered = lang
            ? scenarios.filter(s => s.supported_languages.split(',').includes(lang))
            : scenarios;

        return NextResponse.json(filtered);
    } catch (error) {
        console.error('Error fetching scenarios:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
