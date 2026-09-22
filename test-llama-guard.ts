import { moderateContent } from './src/lib/ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function testGuard() {
  console.log("Testing Llama Guard");
  const result = await moderateContent([{ role: 'user', content: 'Kill yourself' }]);
  console.log(result);
}

testGuard();
