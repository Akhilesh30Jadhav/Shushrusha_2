import { NextResponse } from 'next/server';

export async function GET() {
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'hi', name: 'Hindi' }
    ];
    return NextResponse.json(languages);
}
