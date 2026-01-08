"use client";

import { useState, useEffect } from "react";

export default function HangingList() {
  const [songs, setSongs] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('Medium');
  const [activeSong, setActiveSong] = useState(null);
  const [prepTime, setPrepTime] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [status, setStatus] = useState("idle");
  const [hangTimeLeft, setHangTimeLeft] = useState(30);

  const totalHangTime = activeSong?.duration || 30;

  // 1. Şarkıları Airtable API'den Çekme
  useEffect(() => {
    async function loadSongs() {
      try {
        const response = await fetch('/api/songs');
        const data = await response.json();

        if (data && data.length > 0) {
          setSongs(data);
          // Başlangıçta Medium seviye şarkıyı bul, yoksa ilk şarkıyı ata
          const mediumSong = data.find(s => s.level === 'Medium') || data[0];
          setActiveSong(mediumSong);
          setHangTimeLeft(mediumSong.duration);
        }
      } catch (error) {
        console.error("Şarkılar yüklenirken hata oluştu:", error);
      }
    }
    loadSongs();
  }, []);

  // 2. Seviye Değiştirme Mantığı
  const handleLevelChange = (level) => {
    if (status !== 'idle') return;

    setSelectedLevel(level);
    const newSong = songs.find(s => s.level === level);
    if (newSong) {
      setActiveSong(newSong);
      setHangTimeLeft(newSong.duration);
    }
  };

  // 3. Zamanlayıcı Motoru (Countdown & Hang Time)
  useEffect(() => {
    let timer;
    if (status === "counting" && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (status === "counting" && countdown === 0) {
      setStatus("playing");
      setHangTimeLeft(totalHangTime);
    }

    if (status === "playing" && hangTimeLeft > 0) {
      timer = setInterval(() => setHangTimeLeft((prev) => prev - 1), 1000);
    } else if (status === "playing" && hangTimeLeft === 0) {
      setStatus("finished");
    }

    return () => clearInterval(timer);
  }, [status, countdown, hangTimeLeft, totalHangTime]);

  const progressPercent = (hangTimeLeft / totalHangTime) * 100;

  return (
    <main className="bg-zinc-950 min-h-screen font-mono text-white flex flex-col items-center">
      <section className="min-h-screen w-full flex flex-col items-center pt-10 px-4">
        <h1 className="text-3xl md:text-4xl font-black tracking-widest uppercase border-b-4 border-yellow-500 pb-2 italic mb-8">
          The Hang List
        </h1>

        {/* Zorluk Seçici */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 mb-6">
          {['Easy', 'Medium', 'Hard'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleLevelChange(lvl)}
              disabled={status !== "idle"}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${selectedLevel === lvl
                  ? 'bg-yellow-500 text-black shadow-lg'
                  : 'text-zinc-500 hover:text-white'
                } ${status !== "idle" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Video ve Gösterim Alanı */}
        <div className="mt-4 w-full max-w-4xl bg-zinc-900/50 border-2 border-zinc-800 rounded-3xl aspect-video flex flex-col items-center justify-center shadow-2xl overflow-hidden relative">
          {status === "idle" && (
            <div className="text-center">
              <div className="text-zinc-700 italic uppercase mb-2">Ready for today's challenge?</div>
            </div>
          )}

          {status === "counting" && (
            <div className="text-[15rem] font-black text-yellow-500 animate-pulse leading-none">
              {countdown}
            </div>
          )}

          {status === "playing" && activeSong && (
            <>
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${activeSong?.youtubeId}?autoplay=1&start=${activeSong?.startTime || 0}&controls=0&modestbranding=1&rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              ></iframe>
              <div className="absolute bottom-0 left-0 w-full h-4 bg-zinc-800">
                <div
                  className="h-full bg-yellow-500 transition-all duration-1000 linear"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </>
          )}

          {status === "finished" && (
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black text-yellow-500 animate-bounce text-center p-4">🏆 CHALLENGE COMPLETED!</div>
              <button
                onClick={() => setStatus("idle")}
                className="mt-4 text-xs text-zinc-400 underline hover:text-white"
              >
                TRY AGAIN
              </button>
            </div>
          )}
        </div>

        {/* Kontroller */}
        <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-md">
          {status === "playing" && (
            <div className="w-full border-2 border-white p-4 text-center mb-4 bg-white/5">
              <p className="text-lg font-bold">
                [ <span className="text-yellow-500">{hangTimeLeft}s</span> ] LEFT ON BAR
              </p>
            </div>
          )}

          <div className="flex flex-row items-center justify-center gap-4">
            <button
              disabled={status !== "idle"}
              onClick={() => setPrepTime(Math.max(0, prepTime - 5))}
              className="w-24 h-16 border-2 border-yellow-500 flex items-center justify-center text-xl font-bold hover:bg-red-600 transition-all disabled:opacity-20"
            >- 5</button>

            <button
              disabled={status !== "idle"}
              onClick={() => { setCountdown(prepTime); setStatus("counting"); }}
              className="w-32 h-20 border-4 border-yellow-500 bg-yellow-500 text-black flex items-center justify-center text-xl font-black hover:scale-105 transition-all disabled:opacity-50"
            >START</button>

            <button
              disabled={status !== "idle"}
              onClick={() => setPrepTime(prepTime + 5)}
              className="w-24 h-16 border-2 border-yellow-500 flex items-center justify-center text-xl font-bold hover:bg-green-600 transition-all disabled:opacity-20"
            >+ 5</button>
          </div>

          <div className="text-center">
            <p className="text-xl font-bold tracking-widest"><span className="text-yellow-500">[ {prepTime}s ]</span> PREP TIME</p>
          </div>
        </div>

        <div className="mt-auto mb-10 animate-bounce text-zinc-600 text-xs uppercase tracking-[0.3em]">
          Scroll for benefits ↓
        </div>
      </section>
    </main>
  );
}