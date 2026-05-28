const { exec } = require('child_process');
const fs = require('fs');

exec('npx tsc --noEmit', (error, stdout, stderr) => {
    fs.writeFileSync('tsc-out.txt', `${stdout}\n\nSTDERR:\n${stderr}`);
});

exec('npm run lint', (error, stdout, stderr) => {
    fs.writeFileSync('lint-out.txt', `${stdout}\n\nSTDERR:\n${stderr}`);
});

exec('npm run build', (error, stdout, stderr) => {
    fs.writeFileSync('build-out.txt', `${stdout}\n\nSTDERR:\n${stderr}`);
});
