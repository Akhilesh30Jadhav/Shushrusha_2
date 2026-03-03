import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const authSession = await getSession();
        if (!authSession || !authSession.userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { scenarioId, answers, startTime, score } = await request.json();

        // Create the MCQ Session
        const mcqSession = await prisma.mcqSession.create({
            data: {
                user_id: authSession.userId,
                scenario_id: scenarioId,
                started_at: new Date(startTime),
                completed_at_optional: new Date(),
                score: score,
                answers: {
                    create: answers.map((a: any) => ({
                        question_id: a.question_id,
                        selected_option_id: a.selected_option_id,
                        is_correct: a.is_correct,
                        is_critical_miss: a.is_critical_miss
                    }))
                }
            }
        });

        return NextResponse.json({ success: true, sessionId: mcqSession.id });
    } catch (error) {
        console.error('Error completing MCQ session:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
