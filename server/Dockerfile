FROM node:18-alpine

WORKDIR /app

# package.json 복사
COPY package*.json ./

# package-lock.json 삭제 후 새로 설치
RUN rm -f package-lock.json
RUN npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE $PORT

# 애플리케이션 실행
CMD ["node", "server.js"]