import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Clearing existing data...');
    await prisma.sessionTurn.deleteMany();
    await prisma.session.deleteMany();
    await prisma.scenarioNode.deleteMany();
    await prisma.scenario.deleteMany();

    console.log('Loading new scenarios...');

    // The user will place their JSON output from the LLM prompt here 
    // or we can seed a sample structured exactly like it.
    const sampleV2Scenario = {
        "scenario_id": "ANC_v2_001",
        "title": "Antenatal Visit (Advanced)",
        "category": "Maternal Health (ANC)",
        "difficulty": "Medium",
        "language": "en",
        "estimated_minutes": 5,
        "start_node": "start",
        "skills_targeted": ["Danger Sign Recognition", "Empathy"],
        "global_scoring": {
            "score_method": "CHECKLIST_RATIO",
            "critical_penalty": 20,
            "min_pass_score": 70
        },
        "checklist_master": [
            {
                "id": "chk_1",
                "label": "Ask about vaginal bleeding",
                "critical": true,
                "keyword_match": ["bleeding", "blood"],
                "intent_match": ["ASK_DANGER_SIGNS"],
                "evidence_hint": "Patient specifically asked about bleeding"
            },
            {
                "id": "chk_2",
                "label": "Ask about severe headache or blurred vision",
                "critical": true,
                "keyword_match": ["headache", "vision", "blur"],
                "intent_match": ["ASK_DANGER_SIGNS"],
                "evidence_hint": "Patient checked for PIH symptoms"
            },
            {
                "id": "chk_3",
                "label": "Show empathy",
                "critical": false,
                "keyword_match": ["worry", "understand", "care"],
                "intent_match": ["EMPATHY_VALIDATE"],
                "evidence_hint": "Reassured the mother"
            },
            {
                "id": "chk_4",
                "label": "Refer to CHC immediately",
                "critical": true,
                "keyword_match": ["refer", "hospital", "chc", "doctor", "immediately", "urgent"],
                "intent_match": ["REFER_URGENT"],
                "evidence_hint": "Immediate referral due to danger signs"
            }
        ],
        "nodes": {
            "start": {
                "patient_text": "Namaste Didi. I am 7 months pregnant. Yesterday I noticed some spotting, and today my head is throbbing badly.",
                "patient_media_url": null,
                "expected_items": ["chk_1", "chk_2", "chk_3"],
                "intent_hints_for_user": ["EMPATHY_VALIDATE", "ASK_DURATION_SEVERITY"],
                "evaluation": {
                    "keyword_rules": {
                        "chk_1": { "match_any": ["bleeding", "spotting", "blood", "how much"], "match_all": [], "negate_if_any": [] },
                        "chk_2": { "match_any": ["headache", "pain", "vision", "see"], "match_all": [], "negate_if_any": [] },
                        "chk_3": { "match_any": ["worry", "understand", "sorry", "care"], "match_all": [], "negate_if_any": [] }
                    },
                    "intent_rules": {
                        "chk_1": { "match_any": ["ASK_DANGER_SIGNS", "ASK_DURATION_SEVERITY"], "match_all": [] },
                        "chk_2": { "match_any": ["ASK_DANGER_SIGNS"], "match_all": [] },
                        "chk_3": { "match_any": ["EMPATHY_VALIDATE"], "match_all": [] }
                    }
                },
                "transitions": [
                    { "type": "intent", "if_intent_any": ["REFER_URGENT"], "next": "referred" },
                    { "type": "keyword", "if_text_contains_any": ["refer", "hospital", "chc", "urgent"], "next": "referred" },
                    { "type": "default", "next": "probed" }
                ]
            },
            "probed": {
                "patient_text": "It's not a lot of blood, but my head hurts so much I can barely open my eyes.",
                "patient_media_url": null,
                "expected_items": ["chk_4"],
                "intent_hints_for_user": ["REFER_URGENT"],
                "evaluation": {
                    "keyword_rules": {
                        "chk_4": { "match_any": ["hospital", "chc", "refer", "doctor", "immediately"], "match_all": [], "negate_if_any": [] }
                    },
                    "intent_rules": {
                        "chk_4": { "match_any": ["REFER_URGENT", "CALL_AMBULANCE_TRANSPORT"], "match_all": [] }
                    }
                },
                "transitions": [
                    { "type": "intent", "if_intent_any": ["REFER_URGENT"], "next": "referred" },
                    { "type": "keyword", "if_text_contains_any": ["refer", "hospital", "chc", "doctor"], "next": "referred" },
                    { "type": "default", "next": "missed_referral" }
                ]
            },
            "referred": {
                "patient_text": "Okay Didi, my husband is here. We will go to the hospital right now.",
                "patient_media_url": null,
                "expected_items": [],
                "intent_hints_for_user": [],
                "evaluation": { "keyword_rules": {}, "intent_rules": {} },
                "transitions": []
            },
            "missed_referral": {
                "patient_text": "I will just lie down and rest as you say. Hopefully it gets better.",
                "patient_media_url": null,
                "expected_items": [],
                "intent_hints_for_user": [],
                "evaluation": { "keyword_rules": {}, "intent_rules": {} },
                "transitions": []
            }
        },
        "end_report_template": {
            "summary_rules": [
                "Highlight all critical missed items first (Bleeding/PIH danger signs)",
                "Give 3 concise improvement suggestions",
                "Add one follow-up action based on scenario"
            ],
            "suggestion_bank": [
                {
                    "when_missed": ["chk_4"],
                    "suggestions": ["Severe headache with blurred vision is a strong indicator of Pre-eclampsia. ALWAYS refer immediately.", "Never suggest resting at home for spotting combined with severe headaches."]
                }
            ]
        }
    };

    const scenariosRaw = { scenarios: [sampleV2Scenario] };

    for (const s of scenariosRaw.scenarios) {
        const createdScenario = await prisma.scenario.create({
            data: {
                id: s.scenario_id,
                title: s.title,
                category: s.category,
                difficulty_optional: s.difficulty,
                supported_languages: s.language,
                estimated_duration_minutes_optional: s.estimated_minutes,
                skills_targeted_json: JSON.stringify(s.skills_targeted),
                global_scoring_json: JSON.stringify(s.global_scoring),
                checklist_master_json: JSON.stringify(s.checklist_master),
                end_report_template_json: JSON.stringify(s.end_report_template)
            }
        });

        const nodeEntries = Object.entries(s.nodes);
        for (const [nodeKey, nodeData] of nodeEntries) {
            await prisma.scenarioNode.create({
                data: {
                    scenario_id: createdScenario.id,
                    node_key: nodeKey,
                    patient_text: (nodeData as any).patient_text,
                    patient_media_url_optional: (nodeData as any).patient_media_url,
                    expected_items_json: JSON.stringify((nodeData as any).expected_items),
                    intent_hints_json: JSON.stringify((nodeData as any).intent_hints_for_user),
                    evaluation_rules_json: JSON.stringify((nodeData as any).evaluation),
                    transitions_json: JSON.stringify((nodeData as any).transitions)
                }
            });
        }
    }

    console.log('Successfully seeded V2 Scenarios!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
