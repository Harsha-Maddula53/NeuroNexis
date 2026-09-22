const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') && !file.includes('rate-limit.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('checkRateLimit(')) {
    // Replace assignments: const rate = checkRateLimit( => const rate = await checkRateLimit(
    content = content.replace(/const (\w+) = checkRateLimit\(/g, 'const $1 = await checkRateLimit(');
    // Replace unassigned calls in tests: checkRateLimit( => await checkRateLimit(
    content = content.replace(/^(\s*)checkRateLimit\(/gm, '$1await checkRateLimit(');
    fs.writeFileSync(f, content);
  }
});
// Need to make test cases async if they use await
const testFile = path.resolve('./src/lib/rate-limit.test.ts');
if (fs.existsSync(testFile)) {
  let testContent = fs.readFileSync(testFile, 'utf8');
  testContent = testContent.replace(/test\("([^"]+)", \(\) => {/g, 'test("$1", async () => {');
  fs.writeFileSync(testFile, testContent);
}

console.log('Updated checkRateLimit calls safely.');
