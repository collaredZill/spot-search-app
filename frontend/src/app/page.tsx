'use client';
import dynamic from 'next/dynamic';

// MapLibreのSSRエラーを防ぐため dynamic import を使用
const Map = dynamic(() => import('../components/Map'), { ssr: false });

export default function Home() {
  return (
    <main style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Map />
    </main>
  );
}