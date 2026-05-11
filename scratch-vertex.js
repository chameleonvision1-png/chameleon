const { createVertex } = require('@ai-sdk/google-vertex');
const { streamText } = require('ai');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  if (line.trim().startsWith('GOOGLE_VERTEX_') && line.includes('=')) {
    const key = line.split('=')[0];
    let val = line.substring(line.indexOf('=') + 1).trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.substring(1, val.length - 1);
    process.env[key] = val;
  }
});

async function test() {
  try {
    let key = process.env.GOOGLE_VERTEX_PRIVATE_KEY?.replace(/\\n/g, '\n');
    key = key.replace('ZqdV B', 'ZqdV+B');
    const lines = key.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(' ')) console.log(`Line ${i} has space!`, lines[i]);
    }
    console.log("Lines count:", lines.length);
    
    const b64 = lines.slice(1, lines.length - 2).join('');
    const b64Parts = lines.slice(1, lines.length - 2).join('').split('ZqdV B');
    const crypto = require('crypto');
    const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    
    let found = false;
    // Attempt 1: replacing the space with a single character
    for (const char of b64chars) {
        const testB64 = b64Parts[0] + 'ZqdV' + char + 'B' + b64Parts[1];
        const testKey = '-----BEGIN PRIVATE KEY-----\n' + testB64.match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n';
        try {
            crypto.createPrivateKey({ key: testKey, format: 'pem' });
            console.log('SUCCESS! Replaced space with:', char);
            console.log('Valid key:\n', testKey);
            fs.writeFileSync('.env.local.fixed', testKey);
            found = true;
            break;
        } catch (e) {}
    }
    
    if (!found) {
        console.log("Single replacement failed. Trying combinations...");
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
