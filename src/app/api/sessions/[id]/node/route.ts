import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: session_id } = await params;
        const { searchParams } = new URL(request.url);
        const node_key = searchParams.get('key') || 'start';

        const session = await prisma.session.findUnique({
            where: { id: session_id }
        });

        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        const node = await prisma.scenarioNode.findUnique({
            where: {
                scenario_id_node_key: {
                    scenario_id: session.scenario_id,
                    node_key
                }
            }
        });

        if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

        return NextResponse.json({
            node_key: node.node_key,
            patient_text: node.patient_text,
            patient_audio_url: node.patient_audio_url_optional
        });
    } catch (error) {
        console.error('Error fetching node:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
