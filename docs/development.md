# Development Guide

최종 업데이트: 2026-04-06

## 환경 요구사항

- **Node.js** 22+
- **pnpm** 10+
- **Rust** stable (1.77.2+)
- **macOS** 13.0+

## 로컬 개발

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (핫 리로드)
npm run tauri dev

# 프론트엔드만 실행 (Tauri 없이)
pnpm dev
```

## 빌드

```bash
# 릴리스 빌드 (번들 포함)
npm run tauri build

# 릴리스 빌드 (번들 없이, 바이너리만)
npm run tauri build -- --no-bundle

# 빌드 결과물 위치
# src-tauri/target/release/world-clock-mac
# src-tauri/target/release/bundle/macos/World Clock.app
```

## 로컬 설치 (개발용)

```bash
npm run tauri build
cp -R "src-tauri/target/release/bundle/macos/World Clock.app" /Applications/
```

## 프로젝트 설정 파일

| 파일 | 역할 |
|------|------|
| `package.json` | Node 의존성, 스크립트 |
| `tsconfig.json` | TypeScript 설정 |
| `vite.config.ts` | Vite 번들러 설정 |
| `src-tauri/Cargo.toml` | Rust 의존성 |
| `src-tauri/tauri.conf.json` | Tauri 앱 설정 (버전, 번들, 업데이터) |

## 주요 의존성

### Rust (src-tauri/Cargo.toml)

| 패키지 | 용도 |
|--------|------|
| `tauri` v2 | 앱 프레임워크 (tray-icon feature) |
| `chrono` + `chrono-tz` | 타임존 기반 시간 계산 (tray title) |
| `tauri-plugin-updater` | OTA 자동 업데이트 |
| `tauri-plugin-process` | 앱 재시작 (업데이트 후 relaunch) |
| `tauri-plugin-opener` | 외부 링크 열기 |

### Frontend (package.json)

| 패키지 | 용도 |
|--------|------|
| `react` v19 | UI 프레임워크 |
| `@tauri-apps/api` | Tauri IPC (invoke) |
| `@tauri-apps/plugin-updater` | 업데이트 체크 JS API |
| `@tauri-apps/plugin-process` | relaunch JS API |

## 설정 저장 방식

모든 사용자 설정은 **localStorage**에 저장된다:

| 키 | 타입 | 기본값 | 설명 |
|----|------|--------|------|
| `world-clock-cities` | `City[]` (JSON) | DEFAULT_CITIES | 등록된 도시 목록 |
| `world-clock-base` | `string` (숫자) | `"0"` | 기준 도시 인덱스 |
| `world-clock-24h` | `"true"` \| `"false"` | `"true"` | 24시간 표시 여부 |

## Tauri IPC Commands

| 커맨드 | 파라미터 | 설명 |
|--------|----------|------|
| `update_tray_config` | `{ timezone, flag, use_24h }` | Rust tray 설정 동기화 |
