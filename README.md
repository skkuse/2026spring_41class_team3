# MARS (Minutes to Action & Review System) 🚀
> **AI 기반 회의록 요약 및 실행 관리 서비스 (Minutes to Action & Review System)**
>


---

## 📌 Project Background & Core Value
많은 팀 프로젝트에서 회의 후 **모호한 결론**과 **불분명한 후속 조치**로 인해 회의 생산성 저하를 겪고 있습니다. 기존의 단순 요약 서비스(CLOVA Note, Otter.ai 등)는 정보의 단순 나열에 그쳐 즉각적인 작업 수행으로 이어지기 어렵다는 한계가 있었습니다.

**MARS**는 이러한 문제를 해결하기 위해 **실행(Action) 중심**으로 설계된 DX 솔루션입니다. 회의록 텍스트를 분석하여 액션 아이템을 자동으로 도출하고, 우선순위 매트릭스 기반 대시보드를 제공하여 팀의 실행력을 극대화하는 것을 목적으로 합니다.

### User Requirement:
* **프로젝트 생성 및 참여**: 프로젝트 단위로 시스템 공간을 형성하여 프로젝트 회의록을 분석하고 Action item을 관리
* **회의록 텍스트 업로드 및 AI 분석 요청**: 사용자의 입력값과 이전 회의 데이터를 토대로 AI Engine의 분석 수행
* **정량적/정성적 회의 생산성 평가**: 완료율 및 진행률 기반 생산성 스코어링 및 피드백 제공
* **Action Item 상태 관리**: 아이젠하워 매트릭스 기반 Action item의 우선순위 정렬, 대시보드에서 수행 상태 관리

---

## 🛠️ Tech Stack & Architecture

본 프로젝트는 검증된 **오픈소스 소프트웨어 및 프레임워크**를 활용하여 구축되었습니다.

### Technology Stack
* **Frontend**: React, TypeScript (Vercel 배포)
* **Backend**: FastAPI (Python), SQLAlchemy (ORM)
* **Database**: PostgreSQL
* **AI & Metrics Layers**: OpenAI API, Hugging Face Space, KcELECTRA (BERTScore Engine)

### System Architecture
```
[Frontend: React & TS] ──(HTTP/JSON)──► [FastAPI Server] ──► [PostgreSQL]
│
├─► [Analyzer: OpenAI API]
└─► [Evaluator: Hugging Face (KcELECTRA)]
```

* **Layered Architecture**: 백엔드는 `API Router` ➔ `Service Layer` ➔ `CRUD Layer` ➔ `Models/Schemas` 체계의 Layered Architecture를 엄격히 준수합니다.
* **AI 연산 격리**: 서버 리소스 최적화 및 프리티어 환경의 메모리 다운 방지를 위해, BERTScore 연산 컴포넌트를 Hugging Face Space 인프라로 격리 분업화했습니다.

---

## 🗄️ Database Schema

* **projects**: 프로젝트 메타데이터 (ID, 프로젝트명, 성격, 마감 기한 등)
* **users**: 팀 멤버 정보 및 소속 프로젝트 매핑
* **meetings**: 원본 회의록 데이터 및 회의 목적 보관
* **meeting_participants**: 회의별 참석 유저 다대다(N:M) 매핑 교차 테이블
* **meeting_summaries**: AI 전체 요약문 및 정성적 피드백 결과물 (1:1 매핑)
* **meeting_productivity**: 정량적 최종 생산성 점수 및 세부 지표 JSON 데이터
* **action_items**: 회의에서 도출된 R&R 태스크 (진행 상태, 중요도, 긴급도, 담당자 FK 포함)
* **agendas**: 차기 제안 안건 목록 및 채택 여부 플래그

---

## 🧪 Testing & Constraints

시스템 가용성과 AI 생성 품질 보장 및 신뢰성 확보를 위해 아래 Testing Policy를 토대로 검증을 완료했습니다.

### 1) Development Testing
* **Unit & Component Testing**: 데이터베이스 접근 API 작동 및 데이터 무결성 100% 검증
* **AI Orchestration**: OpenAI 및 Hugging Face API 간의 Interface 인터랙션 오류 차단
* **Edge Case Handling**: LLM 컨텍스트 토큰 제한 이상 현상 및 JSON 포맷팅 예외 처리

### 2) Performance Goals & Constraints 
* **지연 시간 제한**: 일반적인 API 요청 및 DB CRUD 트랜잭션 처리는 **5초 이내** 완료
* **AI 파이프라인**: 텍스트 분석 및 텍스트 마이닝, 생산성 피드백 전체 오케스트레이션은 최대 **2분 이내** 완료

### 3) Ground Truth 품질 검증 가드레일 (BERTScore)
* AI가 요약한 데이터의 정보 누락 및 환각(Hallucination) 현상을 방어하기 위해 한국어 구어체 특화 `KcELECTRA` 모델 기반의 **BERTScore** 검증 프로세스를 탑재했습니다.
* 분석 결과의 **f1-score 수치가 0.48 이상**인 경우에만 정상 데이터로 판정하여 DB에 반영하며, 기준 미달 시 사용자에게 재요청을 유도하는 인터랙티브 UI 가드레일을 적용했습니다.

---

## 👥 Members & Roles

* **장정우 (Leader)**: AI Pipeline & System Architecture Design, Prompt Engineering & Optimization, BERTScore Evaluation Pipeline Development
* **김도현(Backend)**: Backend RESTful API Development, Database Design, CRUD Layer Architect & Optimization 
* **이채연(PM & Frontend)**: Frontend Project/Meetings/Action Item Page Development, UI/UX Routing Design & Project Management 
* **조아정(Frontend)**: Frontend Dashboard, Suggestion Page Development 