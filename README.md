# 🐾 PetLink - 반려동물 SNS 플랫폼

반려동물과의 일상을 기록하고 공유하는 SNS 플랫폼입니다.  
사용자는 반려동물 프로필을 등록하고, 게시글을 작성하며, 좋아요/팔로우 기능으로 다른 사용자와 소통할 수 있습니다.  
관리자 기능과 신고 시스템도 포함되어 있어 실서비스 수준의 구조를 구현했습니다.

---

## 🛠️ 사용 기술 스택

### 📌 Frontend

- React
- TypeScript
- Axios
- Tailwind CSS

### 📌 Backend

- Node.js
- Express
- TypeScript
- PostgreSQL
- JWT, Bcrypt
- Multer (이미지 업로드)
- Swagger (OpenAPI 문서화 예정)

### ☁️ 배포/기타

- Railway
- Docker (개발용)
- GitHub Actions (CI/CD)

---

## 🔐 주요 기능 (기술 중심 설명)

### ✅ 인증 / 사용자 관리

- 회원가입, 로그인 (JWT + Refresh Token)
- 이메일 인증
- 사용자 프로필 조회, 수정
- Role 기반 권한 처리 (관리자, 일반 사용자)

### 🐶 반려동물 프로필

- 반려동물 등록 / 수정 / 삭제
- 종, 생일, 이미지 등 정보 포함

### 📝 게시글 / 댓글

- 게시글 작성, 수정, 삭제
- 댓글 및 대댓글 기능
- 이미지 업로드, 태그 기능

### ❤️ 소셜 기능

- 좋아요 (게시글 단위)
- 팔로우 / 언팔로우
- 사용자 기반 피드 필터링

### ⚙️ 관리자 기능

- 게시글/댓글 신고 관리
- 사용자 차단 / 자동 밴 처리
- 관리자 대시보드 구현

### 🗺️ 산책 기록 (위치 기반)

- 지도 기반 산책 경로 시각화
- 거리 계산 기능 포함

---

## 🧠 설계 포인트

- RESTful API 설계 및 예외 처리 체계 구축
- DB 정규화 및 관계형 설계 (PostgreSQL)
- 미들웨어 분리, 에러 핸들링 구조화
- 요청 인증 미들웨어 구성

---

## 🧪 테스트

- swagger를 활용한 API 수동 테스트
- Jest 기반 단위 테스트 일부 적용 중 (계속 확장 예정)

---

## 📂 프로젝트 구조

server/
├── controllers/
├── routes/
├── middlewares/
├── services/
├── models/
├── utils/
└── config/

---

## 📸 데모

![게시글 예시](./assets/post-example.png)  
![산책 경로](./assets/walk-path.png)

---

## 📝 향후 개선 예정

- Swagger 기반 API 문서 자동화
- 테스트 코드 100% 커버리지 확보
- 알림 기능 (좋아요/댓글 등)
- 모바일 반응형 UI

---

## 🙋‍♀️ 만든 사람

- 개발자: 李 叡暎 (이예영)
- GitHub: [github.com/yeyoung73](https://github.com/yeyoung73)
