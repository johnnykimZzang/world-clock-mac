# Architecture

최종 업데이트: 2026-04-06

## 개요

World Clock은 macOS 메뉴바에 상주하는 세계 시계 앱이다. Tauri v2 (Rust + React) 기반으로, 메뉴바 아이콘 클릭 시 팝오버 창에 여러 도시의 현재 시간을 표시한다.

## 기술 스택

| 레이어 | 기술 | 역할 |
|--------|------|------|
| 네이티브 백엔드 | Rust + Tauri v2 | 시스템 트레이, 윈도우 관리, tray title 실시간 갱신 |
| 프론트엔드 | React 19 + TypeScript | 팝오버 UI 렌더링 |
| 번들러 | Vite 7 | 프론트엔드 빌드 |
| 패키지 매니저 | pnpm | 의존성 관리 |
| 자동 업데이트 | tauri-plugin-updater | GitHub Releases 기반 OTA 업데이트 |
| CI/CD | GitHub Actions | 태그 푸시 시 자동 빌드 + 릴리스 |

## 디렉토리 구조

```
world-clock-mac/
├── src/                          # 프론트엔드 (React)
│   ├── App.tsx                   # 루트 컴포넌트
│   ├── main.tsx                  # React 진입점
│   ├── hooks/
│   │   ├── useClock.ts           # 시계 상태 관리 (도시, 시간포맷, tray config 동기화)
│   │   └── useUpdater.ts         # 자동 업데이트 체크
│   ├── components/
│   │   ├── CityCard.tsx          # 개별 도시 시간 카드
│   │   ├── TimeSlider.tsx        # 시간 슬라이더 (가상 시간 이동)
│   │   ├── Settings.tsx          # 설정 화면 (도시 관리, 24h/12h 토글)
│   │   └── StarField.tsx         # 야간 배경 장식
│   └── lib/
│       ├── time.ts               # 시간 계산/포맷 유틸리티
│       ├── cities.ts             # 도시/타임존 데이터
│       └── palette.ts            # 시간대별 색상 테마
├── src-tauri/                    # 백엔드 (Rust)
│   ├── src/
│   │   ├── main.rs               # Tauri 진입점
│   │   └── lib.rs                # 핵심 로직: tray, popover, 실시간 갱신
│   ├── Cargo.toml                # Rust 의존성
│   └── tauri.conf.json           # Tauri 설정 (앱 메타, 업데이터, 번들)
├── .github/workflows/
│   └── release.yml               # 자동 릴리스 워크플로우
└── docs/                         # 프로젝트 문서
```

## 핵심 아키텍처 결정

### 1. Tray Title 갱신은 Rust가 담당

메뉴바 시간 표시의 책임은 Rust 백엔드에 있다. 프론트엔드(React webview)는 팝오버가 닫히면 비활성화되므로, `setInterval`로 tray를 갱신하면 멈추는 문제가 있었다.

**현재 구조:**
- Rust `std::thread::spawn` + 1초 `sleep` 루프로 독립적으로 매초 갱신
- `TrayConfig` (timezone, flag, use_24h)를 `Arc<Mutex>` 공유 상태로 관리
- 프론트엔드는 설정 변경 시 `update_tray_config` Tauri command로 동기화만 담당

### 2. 상태 동기화 원칙

```
영구 저장 (source of truth): 프론트엔드 localStorage
실행 중 실시간 상태:         Rust Arc<Mutex<TrayConfig>>

앱 시작 → 프론트 마운트 → localStorage 읽기 → update_tray_config 호출 → Rust 동기화
```

### 3. 시간 계산은 Intl API (프론트) + chrono-tz (백엔드)

- 프론트엔드: `Intl.DateTimeFormat`으로 타임존 변환 (DST 자동 반영)
- 백엔드: `chrono` + `chrono-tz`로 독립적 시간 계산

## 데이터 흐름

```
[Rust Background Thread]
  │ 매초 실행
  ├── Arc<Mutex<TrayConfig>> 읽기
  ├── chrono-tz로 현재 시간 계산
  ├── 포맷: "🇰🇷 14:30" 또는 "🇰🇷 2:30 PM"
  └── tray.set_title() 호출
  
[React Frontend] (팝오버 열려있을 때만 활성)
  │ 1초 인터벌
  ├── Intl.DateTimeFormat으로 각 도시 시간 계산
  ├── CityCard 렌더링 (24h/12h 조건부)
  └── 설정 변경 시 → invoke("update_tray_config") → Rust 동기화
```
