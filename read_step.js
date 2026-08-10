const fs = require('fs');
const lines = fs.readFileSync('C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\128745ae-dec9-409b-834c-1a385f03e0c2\\.system_generated\\logs\\transcript_full.jsonl', 'utf8').split('\n');
for (let i = 818; i <= 825; i++) {
    lines.forEach((l) => { if (l.includes('step_index":'+i)) console.log('Step', i, ':', JSON.parse(l).content); });
}
