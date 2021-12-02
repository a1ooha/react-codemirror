export const languages = [
  {
    name: 'Markdown',
    filename: 'README.md',
    text: `# Oh hi Markdown

foo \`bar\`

**bold**

*italic*

> blockquote

## bullets
* a
* b

## lists
- [x] yes
- [ ] no

## code
\`\`\`js
const a = 1;
\`\`\`

\`\`\`python
def hello_world():
  return 'Hello, World!'
\`\`\``,
  },

  {
    name: 'Python',
    filename: 'server.py',
    text: `from flask import Flask
app = Flask('app')

@app.route('/')
def hello_world():
  return 'Hello, World!'

app.run(host='0.0.0.0', port=8080)`,
  },

  {
    name: 'JavaScript',
    filename: 'index.js',
    text: `const crypto = require('crypto');
const alice = crypto.getDiffieHellman('modp5');
const bob = crypto.getDiffieHellman('modp5');

alice.generateKeys();
bob.generateKeys();

const alice_secret = alice.computeSecret(
    bob.getPublicKey(), null, 'hex'
);
const bob_secret = bob.computeSecret(
    alice.getPublicKey(), null, 'hex'
);

// alice_secret and bob_secret should be the same
console.log(alice_secret == bob_secret);`,
  },
  {
    name: 'CSS',
    filename: 'style.css',
    text: `body {
color: red;
}
main {
  display: flex;
  }
.nav {
  justify-content: flex-start;
}
    `,
  },
];
