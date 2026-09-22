const https = require('https');
require('dotenv').config();

const req = https.request({
  hostname: 'api.groq.com',
  path: '/openai/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.stringify(JSON.parse(data), null, 2)));
});

req.on('error', console.error);
req.write(JSON.stringify({
  model: 'openai/gpt-oss-20b',
  messages: [{role: 'user', content: 'hello'}]
}));
req.end();
