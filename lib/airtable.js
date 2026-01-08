// lib/airtable.js
import Airtable from 'airtable';

// Airtable bağlantısını yapılandır
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_TOKEN }).base(
  process.env.AIRTABLE_BASE_ID
);

// Tablo adınızı buraya yazın
const table = base('Songs'); // 'Songs' yerine Airtable'daki tablo adınızı yazın

export async function getDailySongs() {
  console.log("Token:", process.env.AIRTABLE_API_TOKEN ? "OK" : "EKSİK");
  console.log("Base ID:", process.env.AIRTABLE_BASE_ID ? "OK" : "EKSİK");

  try {
    const records = await table.select({ 
      view: "Grid view" // Airtable'daki view adınız
    }).all();

    // Records'ları istediğiniz formata çevirin
    const songs = records.map(record => ({
      id: record.id,
      title: record.fields.Title || '',
      level: record.fields.Level || 'Medium',
      duration: record.fields.Duration || 30,
      youtubeId: record.fields.YoutubeId || '',
      // Diğer alanlarınızı buraya ekleyin
    }));

    return songs;
  } catch (error) {
    console.error("Airtable Error:", error);
    throw error;
  }
}