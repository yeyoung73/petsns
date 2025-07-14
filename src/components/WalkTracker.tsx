// components/WalkTracker.tsx
import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const WalkTracker: React.FC = () => {
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [saved, setSaved] = useState(false);
  const [path, setPath] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState(0);
  const [tracking, setTracking] = useState(true);
  const [memo, setMemo] = useState(""); // Add memo state
  const watchId = useRef<number | null>(null);

  // 거리 계산 함수 (Haversine)
  const calculateDistance = (
    [lat1, lon1]: [number, number],
    [lat2, lon2]: [number, number]
  ) => {
    const R = 6371e3; // Earth radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCenter([latitude, longitude]);
        },
        (err) => {
          console.error("위치 불러오기 실패:", err);
          setCenter([37.5665, 126.978]); // 서울 기본값
        },
        { enableHighAccuracy: true }
      );
    } else {
      setCenter([37.5665, 126.978]); // 위치 지원 안 되는 경우
    }
  }, []);

  useEffect(() => {
    if (tracking && navigator.geolocation) {
      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newPoint: [number, number] = [latitude, longitude];

          setPath((prev) => {
            if (prev.length === 0) return [newPoint];
            const last = prev[prev.length - 1];
            const dist = calculateDistance(last, newPoint);
            setDistance((d) => d + dist);
            return [...prev, newPoint];
          });
        },
        (err) => console.error("위치 추적 실패:", err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [tracking]);

  const handleToggleTracking = () => {
    setTracking((prev) => !prev);
  };

  const handleSave = async () => {
    if (path.length < 2) {
      alert("경로가 너무 짧습니다.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const petId = Number(localStorage.getItem("selected_pet_id"));

      if (!petId) {
        alert("반려동물을 선택해주세요.");
        return;
      }

      const response = await fetch("/api/walks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pet_id: petId,
          route: path, // [{ lat, lng }, ...]
          distance: Math.round(distance * 1000), // m 단위로 저장
          started_at: new Date().toISOString(), // 정확한 시간 포함
          memo: memo?.trim() ? memo.trim() : undefined,
        }),
      });

      if (response.ok) {
        alert("산책 기록이 저장되었습니다!");
        setSaved(true);
        setPath([]);
        setDistance(0);
        setMemo("");
      } else {
        const errorData = await response.json();
        alert(`저장에 실패했습니다: ${errorData.message || "알 수 없는 오류"}`);
      }
    } catch (err) {
      console.error("저장 오류:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const handleReset = () => {
    if (window.confirm("현재 기록을 초기화하시겠습니까?")) {
      setPath([]);
      setDistance(0);
      setMemo("");
      setSaved(false);
      setTracking(true);
    }
  };

  return (
    <div style={{ height: "600px", margin: "2rem auto" }}>
      {/* 위치 정보 로딩 중이면 표시 안 함 */}
      {!center ? (
        <p>📍 현재 위치를 불러오는 중...</p>
      ) : (
        <MapContainer
          center={path.length > 0 ? path[path.length - 1] : center}
          zoom={17}
          scrollWheelZoom={true}
          style={{ height: "400px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          {path.length > 0 && (
            <>
              <Polyline positions={path} color="blue" weight={4} />
              <Marker
                position={path[0]}
                icon={L.divIcon({
                  className: "start-marker",
                  html: "🏁",
                  iconSize: [20, 20],
                })}
              />
              <Marker
                position={path[path.length - 1]}
                icon={L.divIcon({
                  className: "end-marker",
                  html: "📍",
                  iconSize: [20, 20],
                })}
              />
            </>
          )}
        </MapContainer>
      )}

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <p style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          산책 거리: {(distance / 1000).toFixed(2)} km
        </p>

        {/* Memo input */}
        <div style={{ margin: "1rem 0" }}>
          <input
            type="text"
            placeholder="메모를 입력하세요 (선택사항)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ccc",
              width: "200px",
              marginRight: "1rem",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={handleToggleTracking}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              backgroundColor: tracking ? "#f87171" : "#10b981",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {tracking ? "⏸️ 중지" : "▶️ 재시작"}
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "8px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            🔄 초기화
          </button>

          {!saved && path.length > 1 && (
            <button
              onClick={handleSave}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "8px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              💾 저장하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalkTracker;
