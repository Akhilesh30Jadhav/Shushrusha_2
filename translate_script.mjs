import fs from 'fs';
import fetch from 'node-fetch';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function translateText(text, targetLang) {
    if (!text || typeof text !== 'string') return text;
    // Free google translate API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        return json[0].map(item => item[0]).join('');
    } catch (e) {
        console.error("Trans error:", e.message);
        return text;
    }
}

async function translateScenarios(targetLang, outFile) {
    const data = JSON.parse(fs.readFileSync('./src/data/scenarios_mcq.json', 'utf8'));

    for (let i = 0; i < data.length; i++) {
        const s = data[i];
        console.log(`Translating scenario ${s.scenario_id} to ${targetLang}...`);
        s.title = await translateText(s.title, targetLang);
        s.description = await translateText(s.description, targetLang);
        s.category = await translateText(s.category, targetLang);
        await sleep(500); // polite sleep

        for (let j = 0; j < s.questions.length; j++) {
            const q = s.questions[j];
            q.patient_prompt = await translateText(q.patient_prompt, targetLang);
            q.mcq_question = await translateText(q.mcq_question, targetLang);

            // Explainations can be long, so chunking/sleeping helps
            await sleep(300);
            q.explanation_correct = await translateText(q.explanation_correct, targetLang);
            q.explanation_wrong = await translateText(q.explanation_wrong, targetLang);

            for (let k = 0; k < q.options.length; k++) {
                q.options[k].text = await translateText(q.options[k].text, targetLang);
                await sleep(100);
            }
        }
    }

    fs.writeFileSync(`./src/data/${outFile}`, JSON.stringify(data, null, 2));
    console.log(`Saved ${outFile}`);
}

async function run() {
    console.log("Starting Hindi translation...");
    await translateScenarios('hi', 'scenarios_mcq_hi.json');
    console.log("Starting Marathi translation...");
    await translateScenarios('mr', 'scenarios_mcq_mr.json');
    console.log("Done!");
}

run();
