# Features

최종 업데이트: 2026-04-06

## 메뉴바 시계

- macOS 메뉴바에 기준 도시의 현재 시간을 실시간 표시
- 포맷: `🇰🇷 14:30` (24h) 또는 `🇰🇷 2:30 PM` (12h)
- Rust 백그라운드 스레드가 매초 독립적으로 갱신 (팝오버 닫혀있어도 동작)

## 팝오버 (메뉴바 아이콘 클릭)

### 도시 카드
- 등록된 도시별로 현재 시간, 국기, 타임존 약어 표시
- 시간대에 따라 배경 색상 변경 (dawn/day/dusk/night)
- 기준 도시 대비 시차 표시 (+9h, -5h 등)
- 야간에는 StarField 배경 효과
- 카드 클릭으로 기준 도시 변경

### 타임 슬라이더
- 슬라이더를 움직여 가상의 시간대에서 각 도시의 시간 미리보기
- 0~1439분 (24시간) 범위
- "지금" 버튼으로 현재 시간으로 복귀

### 설정
- 도시 추가/제거 (15개 도시 목록)
- 기준 도시 설정
- 24시간/12시간 포맷 토글
- 검색으로 도시 필터링

## 자동 업데이트
- 앱 시작 시 GitHub Releases에서 최신 버전 확인
- 업데이트 가능 시 팝오버 상단에 배너 표시
- 클릭 한 번으로 다운로드 + 설치 + 재시작

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

DST(서머타임)는 `Intl.DateTimeFormat` (프론트) + `chrono-tz` (백엔드)를 통해 자동 반영됨.
