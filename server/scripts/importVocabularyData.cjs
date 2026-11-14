const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function runImport() {
  console.log('🚀 Starting Vocabulary Import Pipeline...');
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_DATABASE || 'english_learning',
    waitForConnections: true,
    connectionLimit: 10
  });

  const connection = await pool.getConnection();
  console.log('✅ Connected to MySQL database successfully.');

  const allWords = [];
  const today = new Date().toISOString().split('T')[0];

  // ==========================================
  // 1. Parse File 1: Phrasal Verbs & Irregular Verbs
  // ==========================================
  const file1Path = './data/1000_Phrasal_Verbs_Va_Dong_Tu_Bat_Quy_Tac.xlsx';
  if (fs.existsSync(file1Path)) {
    console.log(`📖 Reading ${file1Path}...`);
    const wb1 = XLSX.readFile(file1Path);

    for (const sheetName of wb1.SheetNames) {
      if (sheetName === 'TỔNG HỢP') continue;
      const ws = wb1.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (sheetName === 'Sheet22') {
        // --- 1.1 Irregular Verbs ---
        console.log(`  -> Processing Irregular Verbs from sheet ${sheetName}...`);
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[1] || typeof row[1] !== 'string') continue;
          const v1 = row[1].trim();
          if (v1.includes('Nguyên thể') || v1.includes('Tập') || v1 === 'STT') continue;

          const v2 = (row[2] || '').toString().trim();
          const v3 = (row[3] || '').toString().trim();
          const meaning = (row[4] || '').toString().trim();

          const id = `ir_${allWords.length + 1}`;
          allWords.push({
            id,
            word: v1,
            ipa: '',
            meaning: meaning || 'Động từ bất quy tắc',
            partOfSpeech: 'Irregular Verb',
            example: `V1: ${v1} | V2: ${v2} | V3: ${v3}`,
            exampleMeaning: `Quá khứ: ${v2} - Quá khứ phân từ: ${v3}`,
            image: '',
            difficulty: 'Medium',
            topic: 'Động từ bất quy tắc (Irregular Verbs)',
            createdAt: today
          });
        }
      } else {
        // --- 1.2 Phrasal Verbs ---
        const cleanSheetName = sheetName.replace(/Episode \d+:?/i, '').trim();
        for (let r = 0; r < rows.length; r++) {
          const row = rows[r];
          if (!row || !row[1] || typeof row[1] !== 'string') continue;
          let rawWord = row[1].trim();
          if (rawWord.toLowerCase().includes('phrasal verb') || rawWord.startsWith('Episode')) continue;

          // Extract IPA if embedded in word (e.g. "call back /kɔːl bæk/")
          let ipa = '';
          const ipaMatch = rawWord.match(/\/(.*?)\//);
          if (ipaMatch) {
            ipa = `/${ipaMatch[1].trim()}/`;
            rawWord = rawWord.replace(/\/(.*?)\//, '').trim();
          } else if (row[5] && typeof row[5] === 'string' && row[5].includes('/')) {
            const colMatch = row[5].match(/\/(.*?)\//);
            if (colMatch) ipa = `/${colMatch[1].trim()}/`;
          }

          const meaning = (row[2] || '').toString().trim();
          const example = (row[3] || '').toString().trim();
          const exampleMeaning = (row[4] || '').toString().trim();

          const id = `pv_${allWords.length + 1}`;
          allWords.push({
            id,
            word: rawWord,
            ipa,
            meaning: meaning || 'Cụm động từ',
            partOfSpeech: 'Phrasal Verb',
            example,
            exampleMeaning,
            image: '',
            difficulty: 'Medium',
            topic: `1000 Phrasal Verbs - ${cleanSheetName}`,
            createdAt: today
          });
        }
      }
    }
  }

  // ==========================================
  // 2. Parse File 2: Oxford 5000 Vocab (A1 - C1)
  // ==========================================
  const file2Path = './data/Oxford_5000_Vocabulary_A1_C1.xls';
  if (fs.existsSync(file2Path)) {
    console.log(`📖 Reading ${file2Path}...`);
    const wb2 = XLSX.readFile(file2Path);
    const ws2 = wb2.Sheets[wb2.SheetNames[0]];
    const rows2 = XLSX.utils.sheet_to_json(ws2, { header: 1 });

    for (let r = 1; r < rows2.length; r++) {
      const row = rows2[r];
      if (!row || !row[1] || typeof row[1] !== 'string') continue;
      const word = row[1].trim();
      const pos = (row[2] || '').toString().trim();
      const level = (row[3] || '').toString().trim().toUpperCase();
      const ipa = (row[4] || '').toString().trim();
      const meaning = (row[5] || '').toString().trim();
      const example = (row[6] || '').toString().trim();

      let difficulty = 'Medium';
      if (level === 'A1' || level === 'A2') difficulty = 'Easy';
      else if (level === 'B1' || level === 'B2') difficulty = 'Medium';
      else if (level === 'C1' || level === 'C2') difficulty = 'Hard';

      const id = `ox_${allWords.length + 1}`;
      allWords.push({
        id,
        word,
        ipa,
        meaning,
        partOfSpeech: pos,
        example,
        exampleMeaning: '',
        image: '',
        difficulty,
        topic: `Oxford Vocabulary - Level ${level || 'All'}`,
        createdAt: today
      });
    }
  }

  console.log(`\n📊 Total extracted vocabulary records: ${allWords.length}`);

  // ==========================================
  // 3. Batch Insert into MySQL Database
  // ==========================================
  const BATCH_SIZE = 500;
  console.log(`📥 Ingesting into MySQL in batches of ${BATCH_SIZE}...`);

  let insertedCount = 0;
  for (let i = 0; i < allWords.length; i += BATCH_SIZE) {
    const chunk = allWords.slice(i, i + BATCH_SIZE);
    const values = chunk.map(w => [
      w.id,
      w.word,
      w.ipa,
      w.meaning,
      w.partOfSpeech,
      w.example,
      w.exampleMeaning,
      w.image,
      w.difficulty,
      0, // is_learned
      w.topic,
      w.createdAt
    ]);

    const sql = `
      INSERT INTO vocabularies (id, word, ipa, meaning, part_of_speech, example, example_meaning, image, difficulty, is_learned, topic, created_at)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        word = VALUES(word),
        ipa = VALUES(ipa),
        meaning = VALUES(meaning),
        part_of_speech = VALUES(part_of_speech),
        example = VALUES(example),
        example_meaning = VALUES(example_meaning),
        difficulty = VALUES(difficulty),
        topic = VALUES(topic)
    `;

    await connection.query(sql, [values]);
    insertedCount += chunk.length;
    process.stdout.write(`  -> Ingested ${insertedCount}/${allWords.length} words (${Math.round((insertedCount / allWords.length) * 100)}%)\r`);
  }

  console.log(`\n🎉 Ingestion finished! Successfully upserted ${insertedCount} words into MySQL.`);

  // Verify total count in DB
  const [totalRows] = await connection.query('SELECT COUNT(*) as count FROM vocabularies');
  console.log(`✅ Total vocabulary count currently in MySQL database: ${totalRows[0].count} words.`);

  connection.release();
  await pool.end();
  process.exit(0);
}

runImport().catch(err => {
  console.error('\n❌ Ingestion failed:', err);
  process.exit(1);
});
