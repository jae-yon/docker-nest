# --- 빌드 스테이지 ---
FROM node:20-alpine AS build
# 작업 디렉토리 설정
WORKDIR /app
# 의존성 설치 최적화
COPY package*.json ./
# 종속성 설치
RUN npm ci 
# 모든 소스 코드 복사
COPY . .
# 애플리케이션 빌드
RUN npm run build

# --- 프로덕션 스테이지 ---
FROM node:20-alpine AS production
# 작업 디렉토리 설정
WORKDIR /app
# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production
# 빌드 결과물 복사
COPY --from=build /app/dist ./dist
# 포트 노출
EXPOSE 5000
# 애플리케이션 실행 명령어
CMD ["node", "dist/main"]