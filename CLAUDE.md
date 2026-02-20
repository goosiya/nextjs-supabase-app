# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 명령어

```bash
npm run dev      # 개발 서버 시작 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 시작
npm run lint     # ESLint 실행
```

shadcn/ui 컴포넌트 추가:

```bash
npx shadcn@latest add [component-name]
```

## 환경변수 설정

`.env.local` 파일에 다음 변수가 필요합니다:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## 아키텍처 개요

**Next.js 15 App Router + Supabase** 스타터킷입니다.

### 인증 흐름

- `proxy.ts` (루트) → `lib/supabase/proxy.ts`: Next.js 미들웨어 역할. 모든 요청에서 Supabase 세션을 갱신하고, 미인증 사용자를 `/auth/login`으로 리다이렉트
- `app/auth/confirm/route.ts`: 이메일 OTP 확인 핸들러
- 인증된 사용자는 `/protected` 경로로 접근. 미인증 시 자동 리다이렉트

### Supabase 클라이언트 사용 규칙

- **서버 컴포넌트/라우트 핸들러**: `lib/supabase/server.ts`의 `createClient()` 사용 (async)
- **클라이언트 컴포넌트**: `lib/supabase/client.ts`의 `createClient()` 사용
- **중요**: 서버 클라이언트는 절대 전역 변수에 저장하지 말 것. 함수 호출마다 새로 생성해야 함 (Fluid compute 호환)
- 사용자 세션 확인 시 `supabase.auth.getUser()` 대신 `supabase.auth.getClaims()` 사용

### 데이터베이스 타입

`types/database.types.ts`에 Supabase 스키마 타입이 정의되어 있습니다. 현재 `instruments` 테이블과 `profiles` 테이블이 있습니다. 타입이 변경될 경우 Supabase CLI로 재생성:

```bash
npx supabase gen types typescript --project-id [project-id] > types/database.types.ts
```

### 경로 구조

- `/` : 홈 (랜딩)
- `/auth/*` : 인증 관련 (login, sign-up, forgot-password, update-password, confirm, error)
- `/protected/*` : 인증 필요 영역 (protected layout에서 nav/footer 공통 제공)
- `/protected/profile` : 프로필 설정
- `/instruments` : instruments 데이터 예시 페이지 (공개)

### 컴포넌트 구조

- `components/ui/`: shadcn/ui 기반 순수 UI 컴포넌트
- `components/`: 비즈니스 컴포넌트 (auth 폼 등)
- `lib/utils.ts`: `cn()` 유틸리티 함수와 `hasEnvVars` 환경변수 체크

## 핵심 개발 규칙

### Server Components 우선

모든 컴포넌트는 기본적으로 Server Component. `'use client'`는 상태/이벤트 핸들러가 필요한 최소한의 컴포넌트에만 사용.

### Next.js 15 비동기 API

`params`, `searchParams`, `cookies()`, `headers()`는 모두 비동기로 처리:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### 파일 네이밍

- 파일명: `kebab-case.tsx`
- 컴포넌트명: `PascalCase`
- 폴더명: `kebab-case`
- import는 항상 `@/` 경로 별칭 사용 (상대경로 금지)

### 스타일링

- TailwindCSS 유틸리티 클래스 사용 (인라인 스타일 금지)
- 조건부 클래스는 `cn()` (`lib/utils.ts`) 사용
- 컴포넌트 변형은 `class-variance-authority (cva)` 활용

### Export 규칙

- 일반 컴포넌트: Named export (`export function Foo() {}`)
- 페이지 컴포넌트: Default export (`export default function Page() {}`)

## 참고 문서

`docs/guides/` 에 상세 가이드가 있습니다:

- `project-structure.md`: 폴더 구조 및 네이밍 컨벤션
- `component-patterns.md`: 컴포넌트 설계 패턴
- `nextjs-15.md`: Next.js 15 필수 규칙
- `styling-guide.md`: Tailwind + shadcn/ui 스타일링
- `forms-react-hook-form.md`: React Hook Form + Zod + Server Actions 패턴
