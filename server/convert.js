/**
 * Generate Quran pages JSON (Uthmani, Madinah Mushaf)
 * Source: api.quran.com
 * Output: page-based JSON (1–604)
 */

const fs = require("fs");

const TOTAL_PAGES = 604;
const API_BASE = "https://api.quran.com/api/v4";

// Node 18+ has fetch built-in
const fetchPage = async (page) => {
  const url = `${API_BASE}/verses/by_page/${page}?fields=text_uthmani&per_page=300`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch page ${page}`);
  return res.json();
};

const convert = async () => {
  console.log("Fetching Quran pages (Uthmani, Madinah Mushaf)...");

  const pages = {};
  let totalVerses = 0;

  for (let page = 1; page <= TOTAL_PAGES; page++) {
    console.log(`Fetching page ${page}...`);

    const data = await fetchPage(page);
    const verses = data.verses;

    pages[page] = {
      page,
      verses: verses.map(v => ({
        surah: v.surah_id,
        ayah: v.verse_number,
        text: v.text_uthmani,
      })),
    };

    totalVerses += verses.length;
  }

  const output = {
    metadata: {
      mushaf: "madinah",
      script: "uthmani",
      total_surahs: 114,
      total_words: 77430,
      total_characters: 321245,
      total_verses: totalVerses, // should be 6236
      total_pages: TOTAL_PAGES,
    },
    pages,
  };

  fs.writeFileSync(
    "quran-pages-uthmani-new.json",
    JSON.stringify(output, null, 2),
    "utf8"
  );

  console.log("✅ Quran pages JSON generated successfully");
  console.log(`Pages: ${TOTAL_PAGES}`);
  console.log(`Verses: ${totalVerses}`);
};

convert().catch(err => {
  console.error("❌ Error generating Quran JSON:", err);
});
