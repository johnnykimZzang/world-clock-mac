# Features

최종 업데이트: 2026-04-16

## 메뉴바 시계

- macOS 메뉴바에 기준 도시의 현재 시간을 실시간 표시
- 포맷: `🇰🇷 14:30` (24h) 또는 `🇰🇷 2:30 PM` (12h)
- Rust 백그라운드 스레드가 매초 독립적으로 갱신 (팝오버 닫혀있어도 동작)

## 팝오버 (메뉴바 아이콘 클릭)

### 기준 도시 (Hero)
- 아날로그 다이얼 + 큰 시각, 날짜·요일, 실제 일출/일몰 시각, 밤에는 달의 위상
- 다이얼을 드래그해 시간 이동 (한 바퀴 = 12시간, 놓으면 5분 단위로 맞춤)
- 트랙패드 스크롤/마우스 휠로 15분씩 이동
- 얇은 레일 슬라이더: 배경색이 그 날 실제 새벽/낮/저녁/밤 구간을 따름, 미리보기 중엔 현재 시각 표시
- 미리보기 중 "+N시간 미리보기 · 지금으로" 표시
- 업무시간 겹침 띠: 기준 도시의 하루 24칸에 근무 중(평일 9–18시) 도시 수를 표시, 최다 겹침 구간 강조, 칸 클릭 시 해당 시각으로 이동

### 도시 타일 (2열 위젯)
- 시각, 국기, 기준 대비 시차, 그 시점에 맞는 타임존 약어 (CET/CEST, GMT/BST 등)
- 빛(해/달) 위치: 도시 좌표로 계산한 실제 태양 고도 → 계절에 따라 일출·일몰과 높이가 달라짐
- 상태 칩: 근무 중 / 출근 전 / 퇴근 후 / 수면 중(23–7시) / 주말
- 기준 도시와 날짜가 다르면 "내일"/"어제" 표시
- 타일 클릭으로 기준 도시 변경

### 서머타임 알림
- 7일 안에 서머타임이 바뀌어 기준 도시와 시차가 달라지는 도시를 D-day와 함께 표시 (예: 시차 −16h → −17h)
- 닫으면 해당 전환에 대해서는 다시 표시하지 않음

### 테마
- 시스템 라이트/다크 모드 자동 대응 (`prefers-color-scheme`)
- macOS 강조색을 다이얼 바늘·슬라이더·배지에 반영 (`system_look` 커맨드, 팝오버가 포커스될 때 갱신)
- "동작 줄이기" 설정 시 애니메이션 생략

### 설정
- 도시 추가/제거 (15개 도시 목록)
- 기준 도시 설정
- 24시간/12시간 포맷 토글
- 로그인 시 자동 시작 토글 (`tauri-plugin-autostart`, macOS LaunchAgent)
- 검색으로 도시 필터링

### 창 동작
- macOS 26+: Liquid Glass (`NSGlassEffectView`, 런타임 감지) / 그 이전: 반투명 vibrancy (`Effect::Popover`) — 16px 둥근 모서리
- 메뉴바 아이콘 바로 아래에 표시, 화면 가장자리·작은 화면에서는 모니터 안쪽으로 위치/높이 보정
- Dock 아이콘 없음 (`ActivationPolicy::Accessory`)
- 열린 상태에서 메뉴바 아이콘 클릭 시 닫힘, Esc로 닫기

## 자동 업데이트
- 앱 시작 시 GitHub Releases에서 최신 버전 확인
- 업데이트 가능 시 팝오버 상단에 배너 표시 (보라색)
- 클릭 한 번으로 다운로드 + 설치 + 재시작

## 트레이 컨텍스트 메뉴 (우클릭)
- 현재 버전 표시 (비활성 항목, 정보 표시용)
- 업데이트 확인: 수동으로 최신 버전 체크. 최신이면 팝오버에 "최신 버전입니다" 토스트 3초 표시
- 종료

## 설정 화면 하단
- 현재 앱 버전 표시 (`World Clock vX.X.X`)

## 지원 도시

| 도시 | 타임존 | 기본 포함 |
|------|--------|----------|
| Seoul | Asia/Seoul | O |
| Los Angeles | America/Los_Angeles | O |
| Paris | Europe/Paris | O |
| London | Europe/London | O |
| Bangkok | Asia/Bangkok | O |
| New York | America/New_York | |
| Tokyo | Asia/Tokyo | |
| Sydney | Australia/Sydney | |
| Dubai | Asia/Dubai | |
| Singapore | Asia/Singapore | |
| Berlin | Europe/Berlin | |
| Shanghai | Asia/Shanghai | |
| São Paulo | America/Sao_Paulo | |
| Mumbai | Asia/Kolkata | |
| Toronto | America/Toronto | |
| Jakarta | Asia/Jakarta | |
| Istanbul | Europe/Istanbul | |
| Honolulu | Pacific/Honolulu | |
| Anchorage | America/Anchorage | |
| Athens | Europe/Athens | |

DST(서머타임)는 `Intl.DateTimeFormat` (프론트) + `chrono-tz` (백엔드)를 통해 자동 반영됨.
