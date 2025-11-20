import { sql } from '../src/db/neon.js';

const SCHEMA = process.env.DB_SCHEMA || 'fly_voice_agent';
const PHONE = '+17753767929';

async function checkQACount() {
  const result = await sql(`
    SELECT
      bc.user_id,
      bc.business_name,
      bc.common_faqs
    FROM ${SCHEMA}.users u
    JOIN ${SCHEMA}.business_config bc ON u.user_id = bc.user_id
    WHERE u.twilio_phone_number = $1
  `, [PHONE]);

  if (result.length > 0) {
    const faqs = result[0].common_faqs;
    console.log('Business:', result[0].business_name);
    console.log('FAQ type:', typeof faqs);

    if (typeof faqs === 'object' && faqs !== null) {
      const keys = Object.keys(faqs);
      console.log('FAQ count:', keys.length);
      console.log('First 3 keys:', keys.slice(0, 3));
    } else if (typeof faqs === 'string') {
      try {
        const parsed = JSON.parse(faqs);
        const keys = Object.keys(parsed);
        console.log('FAQ count (parsed):', keys.length);
        console.log('First 3 keys:', keys.slice(0, 3));
      } catch (e) {
        console.log('Not valid JSON');
      }
    }
  }
}

checkQACount().then(() => process.exit(0)).catch(e => {
  console.error(e.message);
  process.exit(1);
});
