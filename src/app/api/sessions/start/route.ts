import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { user_id, device_id, lang, scenario_id } = body;

        if (!scenario_id || !lang) {
            return NextResponse.json({ error: 'scenario_id and lang are required' }, { status: 400 });
        }

        // Verify scenario exists
        const scenario = await prisma.scenario.findUnique({
            where: { id: scenario_id },
            include: { nodes: true }
        });

        if (!scenario) {
            return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
        }

        // Find the starting node (usually key 'start')
        const startNode = scenario.nodes.find(n => n.node_key === 'start');

        if (!startNode) {
            return NextResponse.json({ error: 'Scenario start node not found' }, { status: 500 });
        }

        // Start session
        const session = await prisma.session.create({
            data: {
                user_id: user_id || null,
                device_id: device_id || null,
                scenario_id,
                language: lang,
            }
        });

        return NextResponse.json({
            session_id: session.id,
            start_node_key: startNode.node_key,
            scenario_metadata: {
                title: scenario.title,
                category: scenario.category
            }
        });

    } catch (error) {
        console.error('Error starting session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
