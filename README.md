# DIGITAL SAFE — AI 디지털 성범죄 피해자 지원 서비스 (MVP)

> 신고가 두렵지 않은 세상, 피해자가 혼자가 아닌 세상.

디지털 성범죄 피해자가 **상황을 정리하고, 증거를 안전하게 보존하며, 검증된 공식기관의 도움을 받을 수 있도록** 돕는 안내 서비스의 시연용 최소기능제품(MVP)입니다. 경찰 신고를 대체하지 않으며, 신고 접수·영상 삭제를 직접 수행하지 않습니다.

기준 문서: 상위 폴더의 `텍스트.txt` (DIGITAL SAFE PRD v2.0)

## 기술 스택

| 영역 | 선택 | 이유 |
|---|---|---|
| 프레임워크 | Next.js 16 (App Router) + TypeScript | 서버 API route로 AI 키를 브라우저와 완전히 분리. 라우팅·빌드·린트 일체 제공 |
| UI | Tailwind CSS v4 | 반응형·접근성 스타일을 빠르게 구현 |
| 검증 | Zod | 요청 본문과 모델 응답을 서버에서 스키마 검증 |
| AI | `@anthropic-ai/sdk` (서버 전용) | 환경변수가 있을 때만 활성화. 없으면 데모 모드 |
| 테스트 | Vitest + Testing Library | 스키마·데모 생성기·API 라우트·UI 단위 테스트 |
| DB | 없음 | PRD 요구사항: 상담 내용 미저장 |

## 실행 방법

```bash
cd digital-safe
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest
npm run build      # Next.js production build
npm run check      # 위 네 가지를 순서대로 실행
```

## 환경변수 (실제 AI 모드)

`.env.example`을 복사해 `.env.local`을 만듭니다. `.env*`는 `.gitignore`에 포함되어 커밋되지 않습니다.

```
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-...        # 서버에서만 사용. 브라우저에 노출되지 않음
AI_MODEL=                     # 비우면 claude-opus-5-5
AI_API_BASE_URL=              # 프록시 사용 시에만
```

- 값이 비어 있으면 **자동으로 데모 모드**로 동작합니다. 화면에 “데모 모드 — 실제 AI 분석이 아닙니다”가 표시되고 입력 내용은 외부로 전송되지 않습니다.
- 설정되어 있어도 **사용자가 상담 5단계에서 전송에 동의하지 않으면** 외부 AI를 호출하지 않습니다.
- AI 응답이 JSON 스키마 검증에 실패하거나 오류가 나면 **안전한 기본 안내**로 대체하고 그 사실을 화면에 표시합니다.
- 기관 이름·URL·전화번호는 모델 출력에서 절대 가져오지 않습니다. 모델은 기관 `id`만 추천하고, 서버가 `src/data/institutions.ts`의 검증 데이터로 치환합니다.

## 화면 및 경로

| 경로 | 내용 |
|---|---|
| `/` | 메인. 피해 유형 선택, 3대 진입 버튼, 서비스가 하는 일/하지 않는 일 |
| `/consultation` | 5단계: 안전 확인 → 피해 유형 → 현재 상황 → 상황 설명 → 처리 방식(데모/AI 동의) |
| `/result` | 공감 문구, 안전 수준, 사실 요약, 확인 필요 사항, 권장 단계, 공식기관, 초안 만들기, 복사 |
| `/evidence` | 기본 정보 입력(일시·플랫폼·URL·메모) + 자료 체크리스트 + 보존 주의사항 |
| `/report-draft` | 진술서 초안 생성·수정·복사·텍스트 저장(사용자 동작 시에만) |
| `/support` | 전체 기관 카드(출처·확인일 표시), 익명 사전 상담 안내, 삭제 지원 안내 |
| `/privacy` | 수집 항목, 서버 동작, 서비스 한계, 현재 AI 설정 상태 |
| `/settings` | 언어 선택, 동작 모드 확인, 입력 내용 모두 지우기 |
| `POST /api/consultation` | 상담 처리(검증 → 데모/AI → 응답). 저장 없음 |
| `GET /api/status` | AI 설정 여부만 반환(키·모델명 미노출) |

## 개인정보·보안 요약

- 회원가입 없음. 이름·연락처·주소 등 요구하지 않음.
- 상담 입력·증거 메모·초안은 **React 메모리에만** 존재. 탭 종료·새로고침·“모두 지우기” 시 삭제. `localStorage`에는 언어 설정만 저장.
- 서버는 상담 본문을 DB·로그에 기록하지 않음. 오류 시 오류 유형 이름만 `console.warn`.
- 입력 길이 제한(10~2000자), 본문 크기 제한, IP 해시 기준 분당 10회 레이트 리밋.
- 보안 헤더(`X-Frame-Options`, `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy`).
- 파일 업로드·게시판·사례 공유 기능 없음.
- 자세한 내용: [docs/SECURITY.md](docs/SECURITY.md)

## 실제 AI 연결 여부

- 코드상 Anthropic 제공업체 연결이 구현되어 있으나, **이 저장소에는 API 키가 없으므로 기본 상태는 데모 모드**입니다.
- 실제 키로 종단 간 호출을 검증한 것은 아닙니다. 키를 넣은 뒤 `/privacy`에서 “실제 AI 모드 사용 가능”으로 바뀌는지, 상담 결과에 “실제 AI 모드” 배지가 뜨는지 확인하세요.

## 남은 작업 (PRD 2~4단계)

- 기관 운영시간·전화번호 공식 사이트 재확인 후 `lastVerified` 갱신
- 실제 API 키로 AI 모드 종단 간 검증, 제공업체 데이터 보관·학습 정책 고지문 확정
- 브라우저 E2E 테스트(Playwright 등) 추가
- 다중 인스턴스 배포 시 레이트 리밋 외부 스토어로 교체
- 사용자 선택형 사건 기록(보안 검토 후), 추가 언어, 접근성 감사
