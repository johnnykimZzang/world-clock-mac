# Release & Auto-Update

최종 업데이트: 2026-04-06

## 릴리스 플로우

```
코드 변경 → 버전 업데이트 → 태그 푸시 → GitHub Actions 빌드 → Release 생성 → 앱 자동 업데이트
```

### 단계별 가이드

#### 1. 버전 업데이트

`src-tauri/tauri.conf.json`의 `version` 필드 변경:

```json
{
  "version": "0.2.0"
}
```

#### 2. 커밋 + 태그 + 푸시

```bash
git add -A
git commit -m "v0.2.0: 변경 내용 요약"
git tag v0.2.0
git push origin main --tags
```

#### 3. 자동 빌드 (GitHub Actions)

태그 푸시 시 `.github/workflows/release.yml`이 자동 실행:
- macOS aarch64 (Apple Silicon) 빌드
- macOS x86_64 (Intel) 빌드
- GitHub Release 생성
- 업데이트 아티팩트 업로드: `.app.tar.gz`, `.sig`, `latest.json`

#### 4. 앱 자동 업데이트

사용자 앱이 시작 시:
1. `latest.json` 확인 (GitHub Releases에서)
2. 새 버전 감지 → 팝오버 상단에 업데이트 배너 표시
3. "업데이트" 클릭 → 다운로드 + 설치 + 자동 재시작

## 서명 키 관리

### 키 파일 위치

| 파일 | 위치 | 용도 |
|------|------|------|
| Private key | `~/.tauri/world-clock.key` | 빌드 시 앱 서명 (비공개) |
| Public key | `~/.tauri/world-clock.key.pub` | 앱에 내장, 서명 검증용 |

### 키 생성/재생성

```bash
npx tauri signer generate -w ~/.tauri/world-clock.key
```

키를 재생성하면 `tauri.conf.json`의 `plugins.updater.pubkey`도 업데이트 필요.

### GitHub Secrets

Repository Settings > Secrets and variables > Actions > **Repository secrets**:

| Secret 이름 | 값 |
|-------------|-----|
| `TAURI_SIGNING_PRIVATE_KEY` | `~/.tauri/world-clock.key` 파일 내용 |
| `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` | 키 생성 시 설정한 비밀번호 (없으면 빈 값) |

**주의:** Repository **variables**가 아니라 **secrets**에 추가해야 한다. Variables는 로그에 노출됨.

## 업데이트 엔드포인트

```
https://github.com/johnnykimZzang/world-clock-mac/releases/latest/download/latest.json
```

`tauri-apps/tauri-action`이 빌드 시 자동으로 `latest.json`을 생성하고 Release에 업로드한다.

### latest.json 구조

```json
{
  "version": "0.2.0",
  "notes": "릴리스 노트",
  "pub_date": "2026-04-06T12:00:00Z",
  "platforms": {
    "darwin-aarch64": {
      "signature": "서명값",
      "url": "https://github.com/.../World_Clock_0.2.0_aarch64.app.tar.gz"
    }
  }
}
```

## 트러블슈팅

### 업데이트가 감지되지 않을 때

1. `latest.json`이 Release에 정상 업로드되었는지 확인
2. `tauri.conf.json`의 `version`이 현재 설치된 버전보다 낮은지 확인
3. `pubkey`가 빌드에 사용된 private key와 쌍이 맞는지 확인

### GitHub Actions 빌드 실패 시

1. `TAURI_SIGNING_PRIVATE_KEY` secret이 올바르게 설정되었는지 확인
2. Rust/Node 버전 호환성 확인
3. Actions 탭에서 빌드 로그 확인
