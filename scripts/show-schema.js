import { sql } from '../src/db/neon.js';

const SCHEMA = process.env.DB_SCHEMA || 'fly_voice_agent';

async function showSchema() {
  const result = await sql(`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = $1
    ORDER BY table_name, ordinal_position
  `, [SCHEMA]);

  let currentTable = '';
  result.forEach(row => {
    if (row.table_name !== currentTable) {
      console.log(`\n${row.table_name}:`);
      currentTable = row.table_name;
    }
    console.log(`  - ${row.column_name}`);
  });
}

showSchema().then(() => process.exit(0)).catch(e => {
  console.error(e.message);
  process.exit(1);
});
