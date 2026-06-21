# MARS 프론트엔드 코드리뷰 문서

이 문서는 `mars-frontend` 코드리뷰를 위해 작성한 프론트엔드 설명 문서입니다.  
MARS 프론트엔드는 회의록을 기반으로 프로젝트 대시보드, 회의 관리, 액션 아이템 관리, 제안 확인 기능을 제공하는 React 기반 SPA입니다.

## 1. 기술 스택

- React 19
- TypeScript
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React
- Fetch API
- ESLint
- Vercel 배포 설정

## 2. 전체 아키텍처 요약

프론트엔드는 `Vite + React + TypeScript` 기반의 단일 페이지 애플리케이션입니다.  
구조는 크게 `라우팅`, `레이아웃`, `페이지`, `도메인별 컴포넌트`, `API 통신 계층`, `공통 유틸리티`, `스타일`로 나누어져 있습니다.

```text
src
├── main.tsx
├── App.tsx
├── routes
├── layouts
├── pages
├── components
├── lib
└── styles
```

앱의 흐름은 다음과 같습니다.

```text
main.tsx
  → App.tsx
    → AppRouter.tsx
      → ProtectedRoute.tsx
        → AppLayout.tsx
          → 각 page 컴포넌트
            → 도메인별 components
              → lib/api를 통한 백엔드 통신
```

## 3. 주요 폴더 구조

### `src/routes`

라우팅을 담당합니다.

- `AppRouter.tsx`
  - 전체 페이지 경로를 정의합니다.
  - `/`는 랜딩 페이지입니다.
  - `/dashboard`, `/meetings`, `/actions` 등 주요 서비스 화면은 보호 라우트 내부에 있습니다.
- `ProtectedRoute.tsx`
  - 저장된 사용자 정보가 없으면 랜딩 페이지로 리다이렉트합니다.
  - 사용자 정보는 쿠키에 저장된 `mars_user_identity`를 기준으로 확인합니다.

### `src/layouts`

서비스 내부 공통 레이아웃을 담당합니다.

- `AppLayout.tsx`
  - 좌측 사이드바, 네비게이션, 프로젝트 나가기 버튼, 현재 사용자/프로젝트 정보를 표시합니다.
  - `Outlet`을 사용해 현재 라우트에 맞는 페이지를 렌더링합니다.
  - 프로젝트 정보는 `sessionStorage`의 프로젝트 컨텍스트와 백엔드 조회 결과를 함께 사용합니다.

### `src/pages`

라우터에 직접 연결되는 페이지 단위 컴포넌트입니다.

- `Landing.tsx`
  - 사용자 접속, 사용자 생성, 프로젝트 생성, 프로젝트 참여 진입점입니다.
- `DashBoard.tsx`
  - 프로젝트 개요, 참여 코드, 내 액션 아이템 요약, 최근 회의 정보를 보여줍니다.
- `Meetings.tsx`
  - 회의 목록 및 회의 관련 진입 화면입니다.
- `PastMeetings.tsx`
  - 지난 회의 목록과 상세 정보를 표시합니다.
- `MeetingInput.tsx`
  - 회의록 입력 및 AI 분석 요청 흐름을 담당합니다.
- `ActionItems.tsx`
  - 액션 아이템 목록/매트릭스 보기, 담당자 변경, 상태 변경, 우선순위 변경을 담당합니다.
- `Suggestions.tsx`
  - 다음 회의 안건 또는 제안 내용을 확인하는 화면입니다.
- `StyleGuide.tsx`
  - UI 스타일 확인용 페이지입니다.

### `src/components`

페이지에서 사용하는 UI와 도메인 로직을 기능별로 분리했습니다.

- `components/landing`
  - 랜딩 페이지의 사용자 접속, 계정 생성, 프로젝트 생성/참여 모달 관련 컴포넌트가 있습니다.
  - `useLandingPage.ts`가 랜딩 페이지의 상태와 이벤트 흐름을 집중적으로 관리합니다.
- `components/dashboard`
  - 대시보드 카드, 최근 회의 패널, 요약 데이터 생성 로직이 있습니다.
- `components/meetings`
  - 회의 입력 패널, 업로드 옵션, AI 기능 목록, 추출된 액션 아이템 편집 UI가 있습니다.
- `components/actionItems`
  - 액션 아이템 카드, 헤더, 리스트 뷰, 매트릭스 뷰, 그룹화 로직이 있습니다.
- `components/pastMeetings`
  - 지난 회의 카드, 목록, 상세 패널 관련 컴포넌트가 있습니다.

### `src/lib`

공통 유틸리티와 API 계층이 위치합니다.

- `lib/api`
  - 백엔드 API 호출을 도메인별로 분리했습니다.
  - `httpClient.ts`에서 공통 fetch 로직, JSON 변환, timeout, 에러 처리를 담당합니다.
  - `projects.ts`, `users.ts`, `meetings.ts`, `actionItems.ts`, `agendas.ts`로 API가 나뉘어 있습니다.
- `authCookie.ts`
  - 사용자 UUID와 사용자 식별 정보를 쿠키에 저장하고 읽습니다.
- `projectContext.ts`
  - 현재 프로젝트 컨텍스트를 `sessionStorage`에 저장하고 읽습니다.
- `date.ts`, `typography.ts`
  - 날짜 처리와 화면 텍스트 관련 공통 유틸리티입니다.

### `src/styles`

전역 스타일과 테마를 담당합니다.

- `index.css`
- `theme.css`
- `fonts.css`

Tailwind CSS를 기반으로 하되, 프로젝트 전체에서 사용하는 색상과 테마 값은 스타일 파일에서 관리합니다.

## 4. 라우팅 구조

현재 주요 라우트는 다음과 같습니다.

| 경로 | 페이지 | 설명 |
| --- | --- | --- |
| `/` | `Landing` | 사용자 접속, 프로젝트 생성/참여 |
| `/dashboard` | `DashBoard` | 프로젝트 대시보드 |
| `/meetings` | `Meetings` | 회의 관련 메인 화면 |
| `/meetings/past` | `PastMeetings` | 지난 회의 목록/상세 |
| `/meeting/new` | `MeetingInput` | 회의록 입력 및 분석 |
| `/actions` | `ActionItems` | 액션 아이템 관리 |
| `/suggestions` | `Suggestions` | 제안/다음 안건 확인 |
| `/style-guide` | `StyleGuide` | 스타일 확인용 페이지 |

`/`를 제외한 주요 서비스 화면은 `ProtectedRoute`와 `AppLayout` 내부에서 렌더링됩니다.  
즉, 사용자가 먼저 랜딩 페이지에서 접속하거나 계정을 생성해야 내부 화면에 들어갈 수 있습니다.

## 5. 사용자 및 프로젝트 상태 관리

별도의 전역 상태 관리 라이브러리는 사용하지 않았습니다.  
현재 상태 관리는 React의 `useState`, `useEffect`, `useMemo`와 브라우저 저장소를 조합해서 처리합니다.

### 사용자 정보

사용자 정보는 `authCookie.ts`에서 쿠키로 관리합니다.

- `mars_user_uuid`
- `mars_user_identity`

`ProtectedRoute`는 이 쿠키 정보를 기준으로 내부 페이지 접근 가능 여부를 판단합니다.

### 프로젝트 정보

현재 선택된 프로젝트 정보는 `projectContext.ts`에서 `sessionStorage`로 관리합니다.

- `userId`
- `userUuid`
- `projectId`
- `projectCode`
- `projectTitle`

이 값은 대시보드, 액션 아이템, 레이아웃 등 여러 화면에서 공통으로 사용됩니다.  
페이지 새로고침 후에도 같은 브라우저 탭 안에서는 프로젝트 컨텍스트를 유지할 수 있습니다.

## 6. API 통신 구조

API 호출은 `src/lib/api`에 모여 있습니다.

```text
lib/api
├── httpClient.ts
├── config.ts
├── types.ts
├── users.ts
├── projects.ts
├── meetings.ts
├── actionItems.ts
├── agendas.ts
└── index.ts
```

### 공통 HTTP 클라이언트

`httpClient.ts`의 `apiRequest` 함수가 모든 API 호출의 공통 진입점입니다.

담당하는 역할은 다음과 같습니다.

- `VITE_API_BASE_URL` 기반으로 API URL 생성
- 요청 body를 JSON 문자열로 변환
- `Accept`, `Content-Type` 헤더 설정
- 기본 timeout 15초 적용
- AI 분석 요청 등 긴 작업에는 별도 timeout 사용 가능
- 응답 JSON 파싱
- 실패 응답을 `ApiError`로 변환

### 환경 변수

백엔드 주소는 `VITE_API_BASE_URL` 환경 변수로 주입합니다.

```env
VITE_API_BASE_URL=http://localhost:8000
```

이 값이 없으면 앱 실행 시 에러가 발생하도록 되어 있습니다.

## 7. 주요 기능 흐름

### 7.1 랜딩 및 프로젝트 진입

관련 파일:

- `pages/Landing.tsx`
- `components/landing/useLandingPage.ts`
- `components/landing/*`
- `lib/api/users.ts`
- `lib/api/projects.ts`

흐름:

```text
사용자 ID 입력
  → 기존 사용자 접속 또는 새 사용자 생성
  → 프로젝트 생성 또는 프로젝트 코드로 참여
  → 사용자 정보는 쿠키 저장
  → 프로젝트 정보는 sessionStorage 저장
  → /dashboard로 이동
```

랜딩 페이지의 복잡한 상태와 이벤트 핸들러는 `useLandingPage.ts`에 모여 있습니다.  
폼 입력, 중복 확인, 사용자 생성, 프로젝트 생성, 프로젝트 참여, 모달 상태를 이 훅에서 관리합니다.

### 7.2 대시보드

관련 파일:

- `pages/DashBoard.tsx`
- `components/dashboard/DashboardStatCard.tsx`
- `components/dashboard/RecentMeetingsPanel.tsx`
- `components/dashboard/dashboardSummary.ts`

역할:

- 현재 프로젝트명과 참여 코드 표시
- 참여 코드 클립보드 복사
- 현재 사용자 기준 액션 아이템 조회
- 액션 아이템과 회의 정보를 조합해 요약 카드 생성
- 최근 회의 정보 표시

대시보드는 `getProjectActionItems`, `getMeeting`, `getProject`를 사용해 필요한 데이터를 불러옵니다.

### 7.3 회의록 입력 및 AI 분석

관련 파일:

- `pages/MeetingInput.tsx`
- `components/meetings/MeetingInputPanel.tsx`
- `components/meetings/ExtractedActionItemsEditor.tsx`
- `lib/api/meetings.ts`
- `lib/api/actionItems.ts`

흐름:

```text
회의 정보 입력
  → 회의 생성 API 호출
  → 생성된 회의에 대해 AI 분석 요청
  → 요약/피드백/액션 아이템 후보 수신
  → 액션 아이템 편집 후 저장
```

AI 분석 요청은 `/meetings/{meetingId}/analyze`를 호출하며, 작업 시간이 길 수 있어 timeout을 120초로 별도 설정했습니다.

### 7.4 액션 아이템 관리

관련 파일:

- `pages/ActionItems.tsx`
- `components/actionItems/ActionItemsHeader.tsx`
- `components/actionItems/ActionItemsListView.tsx`
- `components/actionItems/ActionItemsMatrixView.tsx`
- `components/actionItems/ActionItemCard.tsx`
- `components/actionItems/groupActionItems.ts`
- `lib/api/actionItems.ts`

주요 기능:

- 리스트 보기와 매트릭스 보기 전환
- 내 액션 아이템만 보기
- 미지정 액션 아이템 보기
- 담당자 변경
- 상태 변경
- 우선순위 변경
- 액션 아이템 삭제
- 사용자별 액션 아이템 정렬 순서 저장

상태나 담당자 변경 시 먼저 화면 상태를 업데이트하고, API 실패 시 이전 상태로 되돌리는 방식으로 사용자 경험을 부드럽게 처리합니다.

### 7.5 지난 회의

관련 파일:

- `pages/PastMeetings.tsx`
- `components/pastMeetings/PastMeetingsList.tsx`
- `components/pastMeetings/PastMeetingCard.tsx`
- `components/pastMeetings/PastMeetingDetailPanel.tsx`

역할:

- 프로젝트의 지난 회의 목록 조회
- 선택한 회의 상세 정보 표시
- 회의 요약, 피드백, 다음 안건 등의 정보 확인

## 8. UI 구성 방식

UI는 Tailwind CSS 유틸리티 클래스를 중심으로 작성되어 있습니다.  
아이콘은 `lucide-react`를 사용합니다.

전체 앱은 다음과 같은 화면 구조를 갖습니다.

```text
AppLayout
├── Sidebar
│   ├── MARS 로고
│   ├── 대시보드
│   ├── 회의
│   ├── 지난 회의
│   ├── 액션 아이템
│   ├── 제안
│   └── 프로젝트 나가기
└── Main
    └── 현재 라우트 페이지
```

사이드바는 접기/펼치기를 지원하고, 현재 라우트는 `NavLink`의 active 상태를 이용해 표시합니다.

## 9. 실행 방법

### 의존성 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### 린트

```bash
npm run lint
```

## 10. AI References
본 프론트엔드 디렉토리의 일부 구현, 코드 정리 과정에서 OpenAI Codex의 도움을 받았습니다.  
다만 전체 설계와 기능 방향, 최종 코드 검토 및 반영은 팀의 개발 의도에 맞춰 직접 확인하며 진행했습니다.
