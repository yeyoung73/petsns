import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { petAPI } from "../services/api";
import type { Walk } from "../types/Walk";
import type { Pet } from "../types/Pet";
import styles from "./WalkDetailPage.module.css";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { convertPetData } from "../utils/petUtils";

const WalkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [walk, setWalk] = useState<Walk | null>(null);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalkDetail = async () => {
      // 파라미터 검증 강화
      if (!id) {
        console.error("Walk ID가 없습니다.");
        setError("산책 ID가 없습니다.");
        setLoading(false);
        return;
      }

      // URL 디코딩
      const decodedId = decodeURIComponent(id);
      console.log("Decoded ID:", decodedId);

      // ID가 유효한 숫자인지 확인
      const walkId = parseInt(decodedId, 10);
      if (isNaN(walkId) || walkId <= 0) {
        console.error("유효하지 않은 Walk ID:", decodedId);
        setError(`잘못된 산책 기록 ID입니다: ${decodedId}`);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("Fetching walk with ID:", walkId);

        // 산책 정보 가져오기 (검증된 숫자 ID 사용)
        const walkResponse = await api.get(`/api/walks/${walkId}`);

        if (!walkResponse.data) {
          throw new Error("산책 데이터를 받을 수 없습니다.");
        }

        const walkData = walkResponse.data;
        console.log("Walk data received:", walkData);

        // 데이터 유효성 검사
        if (!walkData.walk_id) {
          throw new Error("산책 데이터가 올바르지 않습니다.");
        }

        // route 데이터 파싱 안전하게 처리
        let parsedPath: number[][] = [];
        if (walkData.route) {
          try {
            parsedPath =
              typeof walkData.route === "string"
                ? JSON.parse(walkData.route)
                : walkData.route;

            // 경로 데이터 유효성 검사
            if (!Array.isArray(parsedPath)) {
              console.warn("경로 데이터가 배열이 아닙니다:", parsedPath);
              parsedPath = [];
            } else {
              // 각 좌표가 올바른 형식인지 확인
              parsedPath = parsedPath.filter(
                (coord) =>
                  Array.isArray(coord) &&
                  coord.length === 2 &&
                  typeof coord[0] === "number" &&
                  typeof coord[1] === "number" &&
                  !isNaN(coord[0]) &&
                  !isNaN(coord[1])
              );
            }
          } catch (parseError) {
            console.error("경로 데이터 파싱 오류:", parseError);
            parsedPath = [];
          }
        }

        // 데이터 변환
        const transformedWalk: Walk = {
          walk_id: walkData.walk_id,
          pet_id: walkData.pet_id,
          started_at: walkData.date || walkData.started_at,
          ended_at: walkData.date || walkData.ended_at,
          distance: Number(walkData.distance) || 0,
          path: parsedPath,
          memo: walkData.memo || "",
          date: walkData.date,
          route: walkData.route,
        };

        setWalk(transformedWalk);

        // 반려동물 정보 가져오기
        if (walkData.pet_id) {
          try {
            const petResponse = await petAPI.getById(walkData.pet_id);
            if (petResponse && petResponse.data) {
              const converted = convertPetData(petResponse.data);
              setPet(converted);
            }
          } catch (petError) {
            console.error("반려동물 정보 불러오기 실패:", petError);
            // 반려동물 정보 실패는 전체 페이지를 실패시키지 않음
          }
        }
      } catch (err: any) {
        console.error("산책 상세 정보 불러오기 실패:", err);

        // 400 에러 (잘못된 ID)인 경우
        if (err.response?.status === 400) {
          setError("잘못된 산책 ID입니다. 올바른 형식의 ID를 사용해주세요.");
        }
        // 404 에러 (존재하지 않는 ID)인 경우
        else if (err.response?.status === 404) {
          setError("해당 산책 기록을 찾을 수 없습니다.");
        }
        // 기타 에러
        else {
          setError("산책 정보를 불러올 수 없습니다.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWalkDetail();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!walk || !window.confirm("이 산책 기록을 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/api/walks/${walk.walk_id}`);
      alert("산책 기록이 삭제되었습니다.");
      navigate(`/walks/pets/${walk.pet_id}`);
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  // 안전한 날짜 포맷팅 함수
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "정보 없음";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "정보 없음" : date.toLocaleDateString();
    } catch {
      return "정보 없음";
    }
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return "정보 없음";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? "정보 없음" : date.toLocaleTimeString();
    } catch {
      return "정보 없음";
    }
  };

  // 좌표 포맷팅 함수
  const formatCoordinate = (coord: number[]) => {
    if (!coord || coord.length < 2) return "정보 없음";
    return `${coord[0].toFixed(6)}, ${coord[1].toFixed(6)}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <p>불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>오류 발생</h3>
          <p>{error}</p>
          <div className={styles.errorActions}>
            <Link to="/walks" className={styles.backButton}>
              산책 기록 목록으로 돌아가기
            </Link>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!walk) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>산책 정보를 찾을 수 없습니다.</p>
          <Link to="/walks" className={styles.backButton}>
            산책 기록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 지도 중심점 계산 (경로가 있는 경우)
  const getMapCenter = () => {
    if (walk.path && walk.path.length > 0) {
      return walk.path[0];
    }
    return [37.5665, 126.978]; // 기본값 (서울)
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <Link to="/walks" className={styles.breadcrumbLink}>
            산책 기록
          </Link>
          {pet && (
            <>
              <span className={styles.breadcrumbSeparator}> / </span>
              <Link
                to={`/walks/pets/${pet.id}`}
                className={styles.breadcrumbLink}
              >
                {pet.name}
              </Link>
            </>
          )}
          <span className={styles.breadcrumbSeparator}> / </span>
          <span className={styles.breadcrumbCurrent}>산책 상세</span>
        </div>

        <h2 className={styles.title}>🚶‍♂️ 산책 상세 정보</h2>
      </div>

      <div className={styles.content}>
        {/* 산책 정보 카드 */}
        <div className={styles.infoCard}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>🐾 반려동물</span>
              <span className={styles.infoValue}>
                {pet ? (
                  <Link to={`/pets/${pet.id}`} className={styles.petLink}>
                    {pet.name}
                  </Link>
                ) : (
                  "정보 없음"
                )}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>📅 날짜</span>
              <span className={styles.infoValue}>
                {formatDate(walk.started_at)}
              </span>
            </div>

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>🕐 시간</span>
              <span className={styles.infoValue}>
                {formatTime(walk.started_at)}
              </span>
            </div>

            {walk.distance > 0 && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>📏 거리</span>
                <span className={styles.infoValue}>
                  {(walk.distance / 1000).toFixed(2)} km
                </span>
              </div>
            )}

            {walk.memo && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>💭 메모</span>
                <span className={styles.infoValue}>{walk.memo}</span>
              </div>
            )}
          </div>
        </div>

        {/* 지도 */}
        {walk.path && walk.path.length > 0 && (
          <div className={styles.mapSection}>
            <h3 className={styles.sectionTitle}>🗺️ 산책 경로</h3>
            <div className={styles.mapContainer}>
              <MapContainer
                center={getMapCenter()}
                zoom={16}
                style={{ height: "500px", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Polyline positions={walk.path} color="blue" weight={4} />

                {/* 시작점 마커 */}
                <Marker
                  position={walk.path[0]}
                  icon={L.divIcon({
                    className: "start-marker",
                    html: "🏁",
                    iconSize: [30, 30],
                  })}
                />

                {/* 종료점 마커 */}
                {walk.path.length > 1 && (
                  <Marker
                    position={walk.path[walk.path.length - 1]}
                    icon={L.divIcon({
                      className: "end-marker",
                      html: "🎯",
                      iconSize: [30, 30],
                    })}
                  />
                )}
              </MapContainer>
            </div>

            <div className={styles.mapInfo}>
              <div className={styles.mapInfoItem}>
                <span className={styles.mapInfoLabel}>🏁 시작점</span>
                <span className={styles.mapInfoValue}>
                  {formatCoordinate(walk.path[0])}
                </span>
              </div>
              {walk.path.length > 1 && (
                <div className={styles.mapInfoItem}>
                  <span className={styles.mapInfoLabel}>🎯 종료점</span>
                  <span className={styles.mapInfoValue}>
                    {formatCoordinate(walk.path[walk.path.length - 1])}
                  </span>
                </div>
              )}
              <div className={styles.mapInfoItem}>
                <span className={styles.mapInfoLabel}>📍 총 포인트</span>
                <span className={styles.mapInfoValue}>
                  {walk.path.length}개
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className={styles.actions}>
          <Link
            to={`/walks/pets/${walk.pet_id}`}
            className={styles.actionButton}
          >
            ← 산책 기록 목록으로
          </Link>

          {pet && (
            <Link to={`/pets/${pet.id}`} className={styles.actionButton}>
              반려동물 프로필 보기
            </Link>
          )}
          <button onClick={() => navigate(`/walks/${walk.walk_id}/edit`)}>
            ✏️ 수정
          </button>
          <button
            onClick={handleDelete}
            className={`${styles.actionButton} ${styles.deleteButton}`}
          >
            🗑️ 삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalkDetailPage;
