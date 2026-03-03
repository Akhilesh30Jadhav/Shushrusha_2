import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ReportClient from './ReportClient';

export default async function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = await params;

    const session = await prisma.mcqSession.findUnique({
        where: { id: sessionId },
        include: { answers: true }
    });

    if (!session) return notFound();

    return <ReportClient session={session} />;
}
