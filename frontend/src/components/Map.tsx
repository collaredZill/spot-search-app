'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface Spot {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}



export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 35.658581,
    lng: 139.745433,
  });
  const [radius, setRadius] = useState<number>(3);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentAddress, setCurrentAddress] = useState<string>('住所を取得中...');

  const fetchSpots = useCallback(async (lat: number, lng: number, rad: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3001/spots/search?lat=${lat}&lng=${lng}&radius=${rad}`,
      );
      if (!res.ok) throw new Error('Failed to fetch spots');
      const data: Spot[] = await res.json();
      setSpots(data);
    } catch (error) {
      console.error('Error fetching spots:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialMap = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [center.lng, center.lat],
      zoom: 12,
    });

    initialMap.addControl(new maplibregl.NavigationControl(), 'top-right');

    // 逆ジオコーディング（座標から住所を取得）
    const fetchAddress = async (lat: number, lng: number) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ja`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        // 住所を取得（取得できない場合はフォールバック）
        const address = data.display_name || '住所情報が見つかりません';
        // 都道府県以降を短く整形したい場合は調整
        setCurrentAddress(address);
      } catch {
        setCurrentAddress('住所の取得に失敗しました');
      }
    };

    // 地図の初期ロード完了時 & 移動終了時（moveend）に住所を更新
    initialMap.on('load', () => {
      fetchAddress(center.lat, center.lng);
    });

    initialMap.on('moveend', () => {
      const c = initialMap.getCenter();
      fetchAddress(c.lat, c.lng);
    });

    // ドラッグ中（move）は「取得中...」などの軽いフィードバックを出すとUX向上
    initialMap.on('move', () => {
      setCurrentAddress('位置変更中...');
    });

    map.current = initialMap;
  }, [fetchSpots]); // 初回マウント時のみ実行

  // マーカー更新
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    spots.forEach((spot) => {
      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div style="color: #333; padding: 4px;">
          <strong style="font-size: 14px;">${spot.name}</strong><br/>
          <span style="font-size: 12px; color: #666;">${spot.address}</span>
        </div>`,
      );

      const marker = new maplibregl.Marker({ color: '#FF0055' })
        .setLngLat([spot.longitude, spot.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  }, [spots]);

  // 半径スライダー変更時
  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
  };

  // 検索ボタン押下時
  const handleSearch = () => {
    if (map.current) {
      const currentCenter = map.current.getCenter();
      const newCenter = { lat: currentCenter.lat, lng: currentCenter.lng };
      setCenter(newCenter);
      fetchSpots(newCenter.lat, newCenter.lng, radius);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 10,
          background: 'white',
          padding: '16px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          color: '#333',
          width: '280px',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 12px 0', fontSize: '18px' }}>周辺スポット検索</h2>
        <div
          style={{
            marginBottom: '12px',
            padding: '8px 10px',
            background: '#f5f5f5',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            height: '68px', // 外枠の高さを固定
            boxSizing: 'border-box', // paddingを含めた高さ計算にする
          }}
        >
          <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>
            現在の中心地点:
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#333',
              wordBreak: 'break-all',
              height: '32px', // テキスト表示部分（約2行分）の高さを固定
              overflowY: 'auto', // 3行以上になった場合のみ内側でスクロール
              lineHeight: '1.3',
            }}
          >
            {currentAddress}
          </div>
        </div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>
            検索半径: <strong>{radius} km</strong>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
          }}
        >
          {loading ? '検索中...' : '現在の中心位置で検索'}
        </button>

        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
          ヒット件数: <strong>{spots.length} 件</strong>
        </div>
        <div style={{ marginTop: '12px', borderTop: '1px solid #eee', paddingTop: '8px' }}>
          {spots.map((spot) => (
            <div
              key={spot.id}
              onClick={() => {
                // リストをクリックしたらその場所へ地図を移動
                map.current?.flyTo({
                  center: [spot.longitude, spot.latitude],
                  zoom: 15,
                });
              }}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{spot.name}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>{spot.address}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 【CSSマーカ：画面中央に固定】 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '16px',
          height: '16px',
          background: '#FF0000', // 赤
          borderRadius: '50%', // 円
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          transform: 'translate(-50%, -50%)', // 正確に中央に配置
          zIndex: 5, // 地図より上、UIより下
          pointerEvents: 'none', // クリックを透過
        }}
      />

      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}