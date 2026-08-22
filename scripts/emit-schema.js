const fs = require('fs');
const path = require('path');
const { GEOSTORY_SCHEMA } = require('../dist/schema.js');

const schemaDir = path.join(__dirname, '..', 'schema');
if (!fs.existsSync(schemaDir)) {
  fs.mkdirSync(schemaDir);
}

const outputPath = path.join(schemaDir, 'geostory-1.0.schema.json');
fs.writeFileSync(outputPath, JSON.stringify(GEOSTORY_SCHEMA, null, 2));

console.log(`Schema emitted to ${outputPath}`);
