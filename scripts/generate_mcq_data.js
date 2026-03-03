const fs = require('fs');
const path = require('path');

const scenarioTemplates = [
    { id: "ANC_DANGER_SIGNS_01", title: "Antenatal Visit: Danger Signs Screening", cat: "Maternal Health (ANC)", diff: "Medium", dur: 5, thumb: "pregnancy checkup / ASHA counseling", qPrefix: "ANC" },
    { id: "PNC_BLEEDING_FEVER_01", title: "Postnatal Follow-up: Heavy Bleeding / Fever", cat: "Maternal Health (PNC)", diff: "Hard", dur: 6, thumb: "postnatal care / mother recovery", qPrefix: "PNC" },
    { id: "CHILD_DIARRHEA_ORS_01", title: "Child Diarrhea: ORS + Zinc + Dehydration", cat: "Child Health", diff: "Medium", dur: 5, thumb: "child care / ORS packet", qPrefix: "DIA" },
    { id: "CHILD_FEVER_DANGER_01", title: "Child Fever: Danger Signs and Referral", cat: "Child Health", diff: "Hard", dur: 6, thumb: "fever care / thermometer", qPrefix: "FEV" },
    { id: "TB_SUSPECT_01", title: "TB Suspect: Cough > 2 Weeks Screening", cat: "Communicable Disease (TB)", diff: "Medium", dur: 6, thumb: "respiratory screening / mask", qPrefix: "TB" },
    { id: "DIABETES_FOLLOWUP_01", title: "Diabetes Follow-up: Adherence + Foot Care", cat: "NCD (Diabetes)", diff: "Medium", dur: 5, thumb: "diabetes care / glucose", qPrefix: "DIA_F" },
    { id: "HYPERTENSION_URGENT_01", title: "Hypertension: Severe Headache / Blurred Vision", cat: "NCD (Hypertension)", diff: "Hard", dur: 5, thumb: "blood pressure / warning signs", qPrefix: "HYP" },
    { id: "IMMUNIZATION_HESITANCY_01", title: "Immunization Counseling: Vaccine Hesitancy", cat: "Immunization", diff: "Easy", dur: 4, thumb: "vaccination / child immunization", qPrefix: "IMM" },
    { id: "NEWBORN_NOT_FEEDING_01", title: "Newborn: Not Feeding and Cold to Touch", cat: "Newborn Care", diff: "Hard", dur: 6, thumb: "newborn warmth / feeding", qPrefix: "NB" },
    { id: "MALNUTRITION_SCREEN_01", title: "Child Malnutrition: MUAC and Feeding Counseling", cat: "Nutrition", diff: "Medium", dur: 6, thumb: "nutrition / healthy foods", qPrefix: "MAL" },
    { id: "FAMILY_PLANNING_01", title: "Family Planning: Method Counseling and Myths", cat: "Women’s Health", diff: "Easy", dur: 5, thumb: "family planning / counseling", qPrefix: "FP" },
    { id: "MENTAL_HEALTH_SUPPORT_01", title: "Mental Health: Stress and Support Screening", cat: "Mental Health", diff: "Medium", dur: 6, thumb: "support / wellbeing", qPrefix: "MH" }
];

const generateQuestions = (count, prefix) => {
    const qs = [];
    for (let i = 1; i <= count; i++) {
        qs.push({
            question_id: `${prefix}_Q${i}`,
            patient_prompt: `The patient presents scenario context part ${i}. What should you do?`,
            mcq_question: `What is the most appropriate next action based on the protocol step ${i}?`,
            options: [
                {
                    option_id: "OPT_A",
                    text: "Correct protocol-aligned action (e.g. counsel and refer)",
                    keywords: ["refer", "counsel"],
                    intents: ["APPROPRIATE_ACTION"]
                },
                {
                    option_id: "OPT_B",
                    text: "Incorrect action (e.g. give home remedy only)",
                    keywords: ["remedy", "wait"],
                    intents: ["INAPPROPRIATE_DELAY"]
                },
                {
                    option_id: "OPT_C",
                    text: "Dangerous action (e.g. ignore danger signs)",
                    keywords: ["ignore", "skip"],
                    intents: ["DANGER_SIGN_MISSED"]
                },
                {
                    option_id: "OPT_D",
                    text: "Partially correct action but missing urgency",
                    keywords: ["monitor", "call tomorrow"],
                    intents: ["PARTIAL_ACTION"]
                }
            ],
            correct_option_id: "OPT_A",
            critical: i % 3 === 0, // Make every 3rd question critical
            explanation_correct: "This is the correct action as it adheres to the standard ASHA protocols.",
            explanation_wrong: "This action risks patient safety or delays necessary care. Always refer immediately if danger signs are present.",
            tags: {
                category: "assessment",
                protocol_step: `step_${i}`
            }
        });
    }
    return qs;
};

const fullScenarios = scenarioTemplates.map(t => ({
    scenario_id: t.id,
    title: t.title,
    category: t.cat,
    difficulty: t.diff,
    duration_minutes: t.dur,
    // source.unsplash.com is shut down, using deterministic picsum.photos seeds
    thumbnail_url: `https://picsum.photos/seed/${t.id}/400/300`,
    short_description: `Learn how to handle ${t.title} correctly in the field.`,
    language: "en",
    skills_targeted: ["Counseling", "Danger Sign Identification", "Immediate Referral"],
    questions: generateQuestions(8, t.qPrefix) // 8 questions per scenario
}));

const outputDir = path.join(__dirname, '../src/data');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'scenarios_mcq.json'), JSON.stringify(fullScenarios, null, 2));

console.log('Successfully generated scenarios_mcq.json with 12 full scenarios.');
