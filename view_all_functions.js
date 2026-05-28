import fs from 'node:fs';

const file = "C:\\Users\\djatt\\Downloads\\demó fogadás\\assets\\js\\app.js";
try {
  const content = fs.readFileSync(file, "utf8");
  const lines = content.split('\n');
  console.log("Functions in app.js:");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("function ") || line.includes(" = function ")) {
      console.log(`Line ${i+1}: ${line.trim()}`);
    }
  }
} catch (err) {
  console.error(err);
}
