import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { petAPI } from "../services/api";
import type { Walk } from "../types/Walk";
import type { Pet } from "../types/Pet";
import styles from "./WalkPage.module.css";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { convertPetListData } from "../utils/petUtils";

const WalkPage: React.FC = () => {
  const { petId: urlPetId } = useParams<{ petId: number }>();
  const navigate = useNavigate();
  const [walks, setWalks] = useState<Walk[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [selectedWalk, setSelectedWalk] = useState<Walk | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (urlPetId) {
      const numericId = parseInt(urlPetId, 10);
      if (!isNaN(numericId)) {
        setSelectedPetId(numericId);
      }
    } else {
      const storedPetId = localStorage.getItem("selected_pet_id");
      if (storedPetId) {
        const numericId = parseInt(storedPetId, 10);
        if (!isNaN(numericId)) {
          setSelectedPetId(numericId);
        }
      }
    }
  }, [urlPetId]);

  // 반려동물 목록 가져오기
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await petAPI.getAll();
        console.log("🔍 반려동물 목록:", response.data);
        setPets(convertPetListData(response.data));
      } catch (err) {
        console.error("반려동물 목록 불러오기 실패:", err);
      }
    };
    fetchPets();
  }, []);

  // 산책 기록 가져오기
  // WalkPage.tsx의 fetchWalks 함수 수정
  // WalkPage.tsx에서 디버깅용 코드 추가
  useEffect(() => {
    const fetchWalks = async () => {
      if (!selectedPetId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 디버깅: 이제 selectedPetId는 이미 숫자
        console.log("selectedPetId:", selectedPetId);
        console.log("selectedPetId type:", typeof selectedPetId);

        console.log("API 호출 URL:", `/api/walks/pets/${selectedPetId}`);

        const res = await api.get(`/api/walks/pets/${selectedPetId}`);

        // 나머지 코드는 동일...
        const transformedWalks = res.data.map((walk: any) => ({
          walk_id: walk.walk_id,
          pet_id: walk.pet_id,
          started_at: walk.started_at,
          ended_at: walk.started_at,
          distance: walk.distance || 0,
          path:
            typeof walk.route === "string"
              ? JSON.parse(walk.route)
              : walk.route,
          memo: walk.memo,
        }));

        setWalks(transformedWalks);
      } catch (err) {
        console.error("산책 데이터 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWalks();
  }, [selectedPetId, pets]);

  const handlePetChange = (petIdString: string) => {
    const numericId = parseInt(petIdString, 10);
    if (!isNaN(numericId)) {
      setSelectedPetId(numericId);
      localStorage.setItem("selected_pet_id", petIdString); // localStorage에는 문자열로 저장
      navigate(`/walks/pets/${numericId}`);
    }
  };

  const selectedPet = pets.find((pet) => pet.id === selectedPetId);

  const calculateTotalDistance = () => {
    return walks.reduce((total, walk) => total + (walk.distance || 0), 0);
  };

  const calculateAverageDistance = () => {
    if (walks.length === 0) return 0;
    return calculateTotalDistance() / walks.length;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>🚶‍♂️ 산책 기록</h2>

        {/* 반려동물 선택 */}
        <div className={styles.petSelector}>
          <select
            value={selectedPetId?.toString() || ""}
            onChange={(e) => handlePetChange(e.target.value)}
            className={styles.petSelect}
          >
            <option value="">반려동물을 선택하세요</option>
            {pets
              .filter((pet) => pet && pet.id != null)
              .map((pet) => (
                <option key={pet.id} value={pet.id.toString()}>
                  {pet.name} ({pet.species})
                </option>
              ))}
          </select>
        </div>

        {/* 선택된 반려동물 정보 */}
        {selectedPet && (
          <div className={styles.petInfo}>
            <h3>{selectedPet.name}의 산책 기록</h3>
            <Link to={`/pets/${selectedPet.id}`} className={styles.petLink}>
              반려동물 프로필 보기
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className={styles.loading}>
          <p>불러오는 중...</p>
        </div>
      ) : !selectedPetId ? (
        <div className={styles.emptyState}>
          <p>반려동물을 선택해주세요.</p>
        </div>
      ) : walks.length === 0 ? (
        <div className={styles.emptyState}>
          <p>아직 산책 기록이 없습니다.</p>
          <Link to={`/pets/${selectedPetId}`} className={styles.goToTracker}>
            산책 추적기로 이동
          </Link>
        </div>
      ) : (
        <div className={styles.content}>
          {/* 통계 정보 */}
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 산책 횟수</span>
              <span className={styles.statValue}>{walks.length}회</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>총 산책 거리</span>
              <span className={styles.statValue}>
                {(calculateTotalDistance() / 1000).toFixed(2)} km
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>평균 산책 거리</span>
              <span className={styles.statValue}>
                {(calculateAverageDistance() / 1000).toFixed(2)} km
              </span>
            </div>
          </div>

          <div className={styles.mainContent}>
            {/* 산책 기록 목록 */}
            <div className={styles.walkList}>
              <h4>산책 기록 목록</h4>
              <ul className={styles.list}>
                {walks.map((walk) => (
                  <li
                    key={walk.walk_id}
                    onClick={() => setSelectedWalk(walk)}
                    className={`${styles.listItem} ${
                      selectedWalk?.walk_id === walk.walk_id
                        ? styles.selected
                        : ""
                    }`}
                  >
                    <div className={styles.walkInfo}>
                      <div className={styles.walkDate}>
                        📅{" "}
                        {new Date(walk.started_at).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </div>

                      <div className={styles.walkTime}>
                        🕐{" "}
                        {new Date(walk.started_at).toLocaleTimeString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false, // 24시간 형식
                        })}
                      </div>

                      <div className={styles.walkDistance}>
                        📏{" "}
                        {walk.distance && walk.distance > 0
                          ? `${(walk.distance / 1000).toFixed(2)} km`
                          : "거리 미측정"}
                      </div>

                      {walk.memo && (
                        <div className={styles.walkMemo}>💭 {walk.memo}</div>
                      )}
                    </div>
                    <div className={styles.walkActions}>
                      <Link
                        to={`/walks/${walk.walk_id}`}
                        className={styles.detailLink}
                      >
                        자세히 보기
                      </Link>
                      <Link
                        to={`/walks/${walk.walk_id}/edit`}
                        className={styles.editLink}
                      >
                        ✏️ 수정
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 선택된 산책 지도 */}
            {selectedWalk &&
              selectedWalk.path &&
              selectedWalk.path.length > 0 && (
                <div className={styles.mapWrapper}>
                  <h4>선택된 산책 경로</h4>
                  <MapContainer
                    center={selectedWalk.path[0] || [37.5665, 126.978]}
                    zoom={16}
                    style={{ height: "400px", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Polyline
                      positions={selectedWalk.path}
                      color="blue"
                      weight={4}
                    />
                    <Marker
                      position={selectedWalk.path[0]}
                      icon={L.divIcon({
                        className: "start-marker",
                        html: "🏁",
                        iconSize: [20, 20],
                      })}
                    />
                    <Marker
                      position={selectedWalk.path[selectedWalk.path.length - 1]}
                      icon={L.divIcon({
                        className: "end-marker",
                        html: "🏁",
                        iconSize: [20, 20],
                      })}
                    />
                  </MapContainer>
                  <div className={styles.walkDetails}>
                    <p>
                      📅 날짜:{" "}
                      {new Date(selectedWalk.started_at).toLocaleString()}
                    </p>
                    {selectedWalk.distance && (
                      <p>
                        📏 거리: {(selectedWalk.distance / 1000).toFixed(2)} km
                      </p>
                    )}
                    {selectedWalk.memo && <p>💭 메모: {selectedWalk.memo}</p>}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WalkPage;
