# SECURITY.md — DIGITAL SAFE MVP 보안·개인정보 설계

## 1. 데이터 최소화 (PRD 7.1)

| 항목 | 구현 |
|---|---|
| 상담 입력·증거 메모·초안 | `SessionProvider`의 React state에만 보관. 서버·localStorage·sessionStorage 미사용. 탭 종료·새로고침·“모두 지우기”로 삭제 |
| 언어 설정 | `localStorage` 키 `digital-safe.locale` (ko/en만) |
| 서버 저장 | 없음. DB 없음 |
| 서버 로그 | 요청 본문을 로그에 남기지 않음. AI 호출 실패 시 오류 클래스 이름만 `console.warn` |
| 파일 업로드 | 미구현(의도적). 입력 필드는 텍스트·날짜·URL만 |
| 회원가입 | 없음 |

## 2. AI 제공업체 전송 (PRD 7.2)

- `AI_PROVIDER`/`AI_API_KEY`가 없으면 `getAiConfig()`가 `configured:false`를 반환하고 라우트는 외부 호출 없이 데모 응답을 반환한다.
- 설정되어 있어도 요청의 `aiConsent !== true`면 외부 호출을 하지 않는다 (`route.test.ts`로 검증).
- 사용자 설명은 `<user_description>` 태그로 감싸 데이터로 취급하도록 시스템 프롬프트에 명시(프롬프트 인젝션 완화).
- 모델 출력은 Zod `ModelOutputSchema`로 검증. 실패 시 `generateSafeFallback`으로 대체하고 `modeReason: "ai_error_fallback"`을 화면에 표시한다.
- 모델은 기관 `id`만 반환하며, URL·전화번호는 `src/data/institutions.ts`에서만 가져온다. 알 수 없는 id는 폐기한다.
- API 키는 `server-only` 모듈(`src/lib/env.ts`, `provider.ts`)에서만 접근. `NEXT_PUBLIC_` 접두사 미사용.

## 3. 웹 보안 (PRD 7.3)

- 입력 검증: `ConsultationRequestSchema` (유형 enum, 설명 10~2000자, trim).
- 본문 크기 제한: `content-length` 및 실제 텍스트 길이 검사 → 413.
- 레이트 리밋: IP SHA-256 해시 앞 8바이트 키로 분당 10회(인메모리, 단일 인스턴스용).
- 응답 헤더: `Cache-Control: no-store`.
- 전역 헤더(`next.config.ts`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy` 카메라·마이크·위치 차단, `poweredByHeader: false`.
- 오류 응답은 오류 코드와 필드 이름만 포함. 입력값·스택·경로 미노출.
- 외부 링크는 `rel="noopener noreferrer"` + `target="_blank"`.
- React의 기본 이스케이프로 XSS 방지. `dangerouslySetInnerHTML` 미사용.
- CSRF: 상태 변경·저장이 없는 API이며 JSON 본문만 받음. 쿠키 인증 없음.
- `robots: noindex`.

## 4. 익명성 표현 (PRD 7.4)

- “완전 익명”, “절대 추적 불가”, “무조건 비밀 보장” 문구 미사용 (`i18n.test.ts`로 검증).
- `/support`, `/privacy`에 호스팅·네트워크 로그 가능성을 명시.

## 5. 배포 전 필수 점검

- [ ] HTTPS 호스팅, 환경변수는 호스팅 비밀 저장소에만 설정
- [ ] 호스팅 업체의 접근 로그 보존 정책 확인 및 개인정보 안내 반영
- [ ] AI 제공업체 데이터 보관·학습 정책 확인 후 동의 문구 확정
- [ ] 기관 연락처·운영시간 재확인, `lastVerified` 갱신
- [ ] 레이트 리밋을 외부 스토어(Redis 등)로 교체(다중 인스턴스 시)
- [ ] CSP 헤더 추가 검토(Next.js inline script nonce 설정 필요)
- [ ] 개인정보 처리방침·법률 검토
