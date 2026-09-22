fetch('https://console.groq.com/docs/deprecations')
  .then(res => res.text())
  .then(t => {
    const matches = t.match(/llama[^\"'<]*/gi);
    if (matches) {
      console.log(Array.from(new Set(matches)));
    } else {
      console.log('No matches');
    }
  });
