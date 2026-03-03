import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Basic Rule-based Evaluation Engine supporting Advanced Scenarios (V2)
function deterministicEvaluate(userText: string, expectedItemsStr: string, evalRulesStr: string, checklistMasterStr: string) {
    const expectedItems = JSON.parse(expectedItemsStr);
    const rules = JSON.parse(evalRulesStr);
    const checklistMaster = JSON.parse(checklistMasterStr);

    const matched = [];
    const missed = [];
    const criticalMissed = [];

    const textLower = userText.toLowerCase();

    for (const itemId of expectedItems) {
        let isMatch = false;
        const checklistEntry = checklistMaster.find((c: any) => c.id === itemId);
        const itemKeywordRules = rules.keyword_rules?.[itemId] || { match_any: [], match_all: [], negate_if_any: [] };

        // Keyword Matching
        const hasAnyMatch = itemKeywordRules.match_any?.length > 0 ? itemKeywordRules.match_any.some((k: string) => textLower.includes(k.toLowerCase())) : false;
        const hasAllMatch = itemKeywordRules.match_all?.length > 0 ? itemKeywordRules.match_all.every((k: string) => textLower.includes(k.toLowerCase())) : true;
        const hasNegateMatch = itemKeywordRules.negate_if_any?.length > 0 ? itemKeywordRules.negate_if_any.some((k: string) => textLower.includes(k.toLowerCase())) : false;

        if ((hasAnyMatch || itemKeywordRules.match_any?.length === 0) && hasAllMatch && !hasNegateMatch) {
            // If there are no keyword rules defined but it's expected, we currently fail it in keyword mode unless intents pass it or generic fallbacks apply.
            if (itemKeywordRules.match_any?.length > 0 || itemKeywordRules.match_all?.length > 0) {
                isMatch = true;
            }
        }

        // Heuristic Intent Matching Fallback (Since LLM intent Extraction is absent in MVP)
        // We check if the user text matches generic intent keywords defined in the checklist master
        if (!isMatch && checklistEntry) {
            const intentKeywords = checklistEntry.keyword_match || [];
            if (intentKeywords.some((k: string) => textLower.includes(k.toLowerCase()))) {
                isMatch = true;
            }
        }

        if (isMatch) {
            matched.push(checklistEntry || { id: itemId, text: "Unknown Item Passed", passed: true });
        } else {
            const missedItem = checklistEntry || { id: itemId, text: "Unknown Item Missed", critical: false };
            missed.push(missedItem);
            if (missedItem.critical) {
                criticalMissed.push(missedItem);
            }
        }
    }

    return { matched, missed, criticalMissed };
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: session_id } = await params;
        const body = await request.json();
        const { node_key, user_text, user_audio_url } = body;

        if (!node_key || !user_text) {
            return NextResponse.json({ error: 'node_key and user_text are required' }, { status: 400 });
        }

        // Get current node
        const session = await prisma.session.findUnique({
            where: { id: session_id },
            include: { scenario: true }
        });

        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        const currentNode = await prisma.scenarioNode.findUnique({
            where: {
                scenario_id_node_key: {
                    scenario_id: session.scenario_id,
                    node_key
                }
            }
        });

        if (!currentNode) return NextResponse.json({ error: 'Node not found' }, { status: 404 });

        // Evaluate
        const { matched, missed, criticalMissed } = deterministicEvaluate(
            user_text,
            currentNode.expected_items_json,
            currentNode.evaluation_rules_json,
            session.scenario.checklist_master_json
        );

        // Record Turn
        await prisma.sessionTurn.create({
            data: {
                session_id,
                node_key,
                user_text,
                user_audio_url_optional: user_audio_url,
                matched_items_json: JSON.stringify(matched),
                missed_items_json: JSON.stringify(missed),
                critical_missed_json: JSON.stringify(criticalMissed)
            }
        });

        // Evaluate Next Node Transition (V2 Schema)
        const transitions = JSON.parse(currentNode.transitions_json);
        let next_node_key = null;

        const tLower = user_text.toLowerCase();

        for (const t of transitions) {
            if (t.type === 'intent' && t.if_intent_any) {
                // Mocking intent extraction: check if text contains words mapping to intent
                if (t.if_intent_any.includes('REFER_URGENT') && (tLower.includes('refer') || tLower.includes('hospital') || tLower.includes('chc'))) {
                    next_node_key = t.next; break;
                }
            }
            else if (t.type === 'keyword' && t.if_text_contains_any) {
                if (t.if_text_contains_any.some((k: string) => tLower.includes(k.toLowerCase()))) {
                    next_node_key = t.next; break;
                }
            }
            else if (t.type === 'default') {
                next_node_key = t.next; // Fallback
            }
        }

        if (!next_node_key) {
            const defaultT = transitions.find((t: any) => t.type === 'default');
            next_node_key = defaultT ? defaultT.next : transitions[0]?.next;
        }

        // Get count for progress estimate
        const turnCount = await prisma.sessionTurn.count({ where: { session_id } });

        return NextResponse.json({
            next_node_key,
            evaluation: {
                matched_items: matched,
                missed_items: missed,
                critical_missed: criticalMissed,
                notes: criticalMissed.length > 0 ? "Danger Sign Missed!" : "Good Work."
            },
            progress: {
                turn_index: turnCount,
                total_turns_estimate: session.scenario.estimated_duration_minutes_optional ? session.scenario.estimated_duration_minutes_optional * 2 : 10
            }
        });

    } catch (error) {
        console.error('Error processing turn:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
