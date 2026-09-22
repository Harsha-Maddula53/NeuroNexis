import * as dotenv from 'dotenv';
dotenv.config();

async function listModels() {
  const res = await fetch("https://api.groq.com/openai/v1/models", {
    headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
  });
  const data = await res.json();
  data.data.forEach((m: any) => console.log(m.id));
}

listModels();
