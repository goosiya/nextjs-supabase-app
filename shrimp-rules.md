# AI Agent 개발 가이드라인

## 1. 프로젝트 개요

- **서비스명**: 모이자(Moija) - 이벤트/모임 생성 및 참여 관리 서비스
- **스택**: Next.js 15 App Router + Supabase + TypeScript + TailwindCSS + shadcn/ui
- **핵심 기능**: 이벤트 생성(호스트), 공개 링크 공유, 참여자 신청 및 관리

---

## 2. 디렉토리 구조 및 파일 배치 규칙

```
app/
  actions/          ← Server Actions (파일당 하나의 도메인)
  auth/             ← 인증 관련 페이지 (login, sign-up, forgot-password 등)
  events/[slug]/    ← 공개 이벤트 상세 페이지 (비인증 접근 가능)
  protected/        ← 인증 필수 영역 (layout.tsx에서 세션 검증)
    events/         ← 호스트 이벤트 관리
    profile/        ← 프로필 설정
  page.tsx          ← 홈(랜딩) 페이지
components/
  ui/               ← shadcn/ui 컴포넌트만 (직접 수정 금지)
  events/           ← 이벤트 도메인 컴포넌트
  *.tsx             ← 공통 컴포넌트 (auth 폼 등)
lib/supabase/
  client.ts         ← 클라이언트 컴포넌트용 Supabase 클라이언트
  server.ts         ← 서버 컴포넌트/Server Actions용 Supabase 클라이언트
  proxy.ts          ← 미들웨어 세션 갱신 로직
types/
  database.types.ts ← Supabase CLI로 자동 생성 (직접 수정 금지)
```

### 파일 배치 규칙

- 새 페이지 → `app/` 하위 적절한 경로에 `page.tsx`
- 새 Server Action → `app/actions/[도메인].ts`
- 인증 필요 페이지 → `app/protected/` 하위
- 새 컴포넌트 → 도메인별 `components/[도메인]/` 폴더

---

## 3. 파일 네이밍 및 Export 규칙

| 대상            | 규칙             | 예시                                     |
| --------------- | ---------------- | ---------------------------------------- |
| 파일명          | `kebab-case.tsx` | `event-card.tsx`                         |
| 컴포넌트명      | `PascalCase`     | `EventCard`                              |
| 폴더명          | `kebab-case`     | `events/`                                |
| import 경로     | 항상 `@/` 사용   | `import { cn } from '@/lib/utils'`       |
| 페이지 컴포넌트 | Default export   | `export default function Page() {}`      |
| 일반 컴포넌트   | Named export     | `export function EventCard() {}`         |
| Server Actions  | Named export     | `export async function createEvent() {}` |

**금지**: 상대경로 import (`../../components/...`) 사용 금지

---

## 4. Supabase 클라이언트 사용 규칙

### 클라이언트 선택

```typescript
// 서버 컴포넌트 / Server Actions / Route Handlers
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient() // 반드시 await

// 클라이언트 컴포넌트 ('use client' 파일)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

**금지**: 서버 클라이언트를 전역 변수에 저장하지 말 것 (매 함수 호출마다 새로 생성)

### 인증 확인

```typescript
// 반드시 getClaims() 사용 (getUser() 사용 금지)
const { data: claimsData, error: authError } = await supabase.auth.getClaims()
const userId = claimsData?.claims?.sub // 사용자 ID 접근법
```

---

## 5. Server Actions 작성 패턴

**필수 패턴** (`app/actions/*.ts`):

```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// 1. Zod 스키마 정의
const schema = z.object({ ... })

export async function myAction(formData: ...) {
  // 2. Supabase 클라이언트 생성
  const supabase = await createClient()

  // 3. 인증 확인 (인증 필요 액션)
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()
  if (authError || !claimsData?.claims) redirect('/auth/login')

  // 4. 입력 검증
  const validated = schema.safeParse(formData)
  if (!validated.success) return { error: validated.error.flatten().fieldErrors }

  // 5. DB 작업
  const { data, error } = await supabase.from('table').insert(...)
  if (error) return { error: { _form: [error.message] } }

  // 6. 캐시 무효화 후 리다이렉트
  revalidatePath('/path')
  redirect('/path')
}
```

---

## 6. Next.js 15 비동기 API 규칙

**모든 페이지의 params/searchParams는 반드시 await 처리**:

```typescript
// 올바른 방법
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
}

// 금지: 직접 접근
export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug // ❌ Next.js 15에서 오류
}
```

`cookies()`, `headers()`도 동일하게 await 처리.

---

## 7. 데이터베이스 스키마

### 핵심 테이블

| 테이블               | 설명             | 주요 컬럼                                                                     |
| -------------------- | ---------------- | ----------------------------------------------------------------------------- |
| `events`             | 이벤트 정보      | id, slug, title, host_id, status, event_date, location, max_participants, fee |
| `event_participants` | 참여자           | id, event_id, user_id(nullable), guest_name, guest_phone, status, attended    |
| `profiles`           | 사용자 프로필    | id, full_name                                                                 |
| `instruments`        | 악기 예시 데이터 | id, name                                                                      |

### 이벤트 상태값

- `draft`: 초안 | `open`: 모집중 | `closed`: 마감 | `completed`: 완료

### 참여자 상태값

- `pending`: 대기 | `confirmed`: 확정 | `cancelled`: 취소

**타입 파일 수정 금지**: `types/database.types.ts`는 Supabase CLI로만 재생성:

```bash
npx supabase gen types typescript --project-id [project-id] > types/database.types.ts
```

---

## 8. 컴포넌트 작성 규칙

### Server Component (기본)

- `'use client'` 없는 모든 컴포넌트
- 데이터 fetching은 Server Component에서 수행 후 props로 전달
- `async/await` 직접 사용 가능

### Client Component (최소화)

- `'use client'` 선언 필수
- 사용 조건: useState, useEffect, 이벤트 핸들러, 브라우저 API 필요 시
- 파일 상단 첫 번째 줄에 `'use client'` 작성

### shadcn/ui 컴포넌트 사용

```bash
# 새 shadcn 컴포넌트 추가 시 반드시 CLI 사용
npx shadcn@latest add [component-name]
```

- `components/ui/` 파일 직접 수정 금지
- 커스터마이즈는 래퍼 컴포넌트 생성

---

## 9. 스타일링 규칙

- TailwindCSS 유틸리티 클래스만 사용 (인라인 스타일 `style={{}}` 금지)
- 조건부 클래스: `cn()` 함수 사용
  ```typescript
  import { cn } from '@/lib/utils'
  className={cn('base-class', condition && 'conditional-class')}
  ```
- 컴포넌트 변형: `class-variance-authority (cva)` 활용

---

## 10. 라우팅 및 접근 제어

| 경로             | 접근      | 설명                                        |
| ---------------- | --------- | ------------------------------------------- |
| `/`              | 공개      | 랜딩 페이지                                 |
| `/auth/*`        | 공개      | 로그인, 회원가입 등                         |
| `/events/[slug]` | 공개      | 이벤트 공개 상세 (참여 신청)                |
| `/instruments`   | 공개      | 예시 데이터 페이지                          |
| `/protected/*`   | 인증 필수 | 미인증 시 `/auth/login`으로 자동 리다이렉트 |

- `proxy.ts` (루트) → 미들웨어 역할, 모든 요청 처리
- `app/protected/layout.tsx` → 인증 검증 레이아웃

---

## 11. 환경변수

```bash
# .env.local 필수 항목
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

- `lib/utils.ts`의 `hasEnvVars`로 환경변수 존재 여부 체크 가능

---

## 12. 개발 명령어

```bash
npm run dev          # 개발 서버 (localhost:3000)
npm run build        # 프로덕션 빌드
npm run lint         # ESLint (app/, components/, lib/, proxy.ts만)
npm run lint:fix     # ESLint 자동 수정
npm run format       # Prettier 전체 포맷팅
npm run type-check   # TypeScript tsc --noEmit
npm run validate     # type-check + lint + format:check 순차 실행
```

---

## 13. Git 커밋 규칙

**형식**: `[이모지] [type]: [한국어 설명]`

| type     | 용도        |
| -------- | ----------- |
| feat     | 새 기능     |
| fix      | 버그 수정   |
| chore    | 빌드/설정   |
| style    | 스타일/포맷 |
| refactor | 리팩토링    |
| docs     | 문서        |

**예시**: `✨ feat: 이벤트 참여자 출석 체크 기능 추가`

---

## 14. 다중 파일 수정 시 동기화 규칙

| 변경 사항                | 동시 수정 필요 파일               |
| ------------------------ | --------------------------------- |
| DB 스키마 변경           | `types/database.types.ts` 재생성  |
| 새 Server Action 추가    | `app/actions/[도메인].ts`         |
| 새 도메인 컴포넌트 추가  | `components/[도메인]/` 폴더 생성  |
| 새 protected 페이지 추가 | `app/protected/[페이지]/page.tsx` |
| 새 공개 이벤트 라우트    | `app/events/[param]/page.tsx`     |

---

## 15. 금지 사항

- `supabase.auth.getUser()` 사용 금지 → `getClaims()` 사용
- 상대경로 import 금지 → `@/` 사용
- 인라인 스타일(`style={{}}`) 사용 금지 → TailwindCSS 사용
- `components/ui/` 파일 직접 수정 금지
- `types/database.types.ts` 직접 수정 금지
- 서버 Supabase 클라이언트 전역 변수 저장 금지
- Next.js 15에서 `params`를 동기적으로 접근 금지 (반드시 await)
- `'use client'` 파일에서 `createClient` from `@/lib/supabase/server` import 금지
