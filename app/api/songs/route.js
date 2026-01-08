import Airtable from 'airtable';
import { NextResponse } from 'next/server';

const base = new Airtable({ 
  apiKey: process.env.AIRTABLE_API_TOKEN 
}).base(process.env.AIRTABLE_BASE_ID);

export async function GET() {
  try {
    // Tablo adın "Table 1", Görünüm adın "Songs"
    const records = await base('Table 1').select({
      view: 'Songs'
    }).all();

    const songs = records.map(record => ({
      id: record.id,
      title: record.get('Name'),        // Sende 'Name' olarak geçiyor
      level: record.get('Level'),       // 'Easy', 'Medium', 'Hard'
      youtubeId: record.get('YouTubeID')?.trim(), // YouTubeID sütunun
      duration: record.get('Duration'),  // Saniye cinsinden süren
      startTime: record.get('Start Time') // İstersen bunu da kullanabiliriz
    }));

    return NextResponse.json(songs);
  } catch (error) {
    console.error("Airtable Hatası:", error);
    return NextResponse.json({ error: "Veri çekilemedi" }, { status: 500 });
  }
}