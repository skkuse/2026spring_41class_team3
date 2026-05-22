# AI implementation

<aside>

**변경사항 (5/22)**

- https://huggingface.co/spaces/jeongwoojang/MARS-evaluateBERT/tree/main
- Hugging Face Space (Docker 기반 CPU 인스턴스 프리티어)에 `KcELECTRA-base-v2022` 모델을 배포하여 evaluate BERTScore 연산 독립 수행
</aside>

---

### 백엔드 구현 필요 사항

2-1. DB Retrieval 함수 작성

- 현재 `main.py`에서 `test_data`를 하드코딩으로 사용 중
- 아래 데이터를 DB에서 조회해오는 함수로 교체 필요 (형식 엄수, CRUD layer에서 구현)
    
    ```
    {
        "meeting_script": str,         # 현재 회의 script 
        "meeting_purpose": str,        # 현재 회의 목적 
        "participants": str,           # 회의 참여자 / 쉼표 구분 문자열 또는 리스트
        "prev_action_items": str,      # 이전 미완료 action item / 없으면 "없음" 또는 "N/A"
        "prev_feedback": str           # 이전 회의 생산성 피드백 / 없으면 "없음" 또는 "N/A"
    }
    ```
    

2-2. 반환값 DB 저장 로직

- GPT 분석 결과 DB 저장하는 CRUD 필요 (CRUD layer에서 구현)
- 저장 형식은 GPT Generated Response Schema([link](https://www.notion.so/AI-implementation-5-22-35a98386bbfc80ec8e81dcfa60f62192?pvs=21)) 참고

2-2. Service 로직 구현 (Layered Architecture) 

- 현재 구현된 analysis, evaluate.py는 Service layer에서 작동
- DB Retrieval CRUD 함수 호출 → main.py와 같이 analysis, evaluate 차례로 수행
- 변경사항: evaluate.py 내부에서 BERTScore 연산 로직 Hugging Face Space API로 구현 완료, analysis.py로 생성된 gpt_response와 raw_text를 parameter로 evaluate.py 호출

2-4. Error Handling

- 아래 케이스에 대한 처리 필요
    - 현재 BertScore threshold 미달 시 return None으로 구현 (main.py) → API error handling으로 재호출 or UI/UX 처리 필요
    
    | 에러 상황 | 예외 클래스 | HTTP 상태코드 |
    | --- | --- | --- |
    | 회의 데이터 미존재 | `MeetingNotFoundException` | 404 |
    | OpenAI API 호출 실패 | `GPTCallException` | 502 |
    | GPT 응답 JSON 파싱 실패 | `GPTResponseParseException` | 500 |
    | BertScore 평가 실패 (threshold 미달) | `AnalysisQualityError` | 422 |
    | HF Space 통신 실패 | `HFSpaceConnectionException` | 504 |
    | DB 저장 실패 | `DatabaseSaveException` | 500 |
    - **BertScore 평가 실패 (threshold 미달):** HF Space API 연산 결과 `recall < 0.7` 미달 시 발생. 프론트엔드 UI/UX 단에서 사용자 재요청 버튼 유도 또는 AI 패러프레이징 재호출 스케줄링 처리 필요
    - **HF Space 통신 실패:** Hugging Face Space 가 Cold Start 중(503)이거나 네트워크 유실 시 처리


## API Specification

POST `/api/v1/meetings/{meeting_id}/analyze`

- **request body** **없음** - meeting_id로 param 전달 시 DB에서 직접 조회 (retrieval)
- response (**200 OK)**
    
    ```
    {
      "meeting_id": 42,
      "summary": "MARS 프로젝트 파트 분배 및 초기 환경 세팅을 논의하였다. AI 파트는 정우, 백엔드는 도현, 프론트엔드는 아정이 담당하기로 결정하였다. 다음 회의 전까지 각자 환경 세팅을 완료하기로 하였다.",
      "action_items": [
        {
          "task": "GPT-4o와 BERT 연결 구현 (담당: 정우)",
          "priority": 1
        },
        {
          "task": "백엔드 API 및 DB 스키마 설계 (담당: 도현)",
          "priority": 1
        },
        {
          "task": "프론트엔드 우선순위 시각화 대시보드 구현 (담당: 아정)",
          "priority": 2
        }
      ],
      "qualitative_feedback": "명확한 역할 분배로 효율적인 회의였다.",
      "next_agenda": [
        "각자 환경 세팅 완료 여부 확인",
        "채연 담당 파트 배정",
        "전체 시스템 아키텍처 리뷰"
      ]
    }
    ```


## AI Docs

폴더 구조

```
AI/
├── main.py          # 전체 플로우 오케스트레이션
├── analyzer.py      # OpenAI API 호출 및 응답 처리
├── prompt.py        # 시스템 프롬프트 템플릿 정의
├── evaluate.py      # BertScore 기반 결과 품질 평가 (Hugging Face API 호출)
└── AI_schema.py     # Backend 용 schema 정의 (ex)
```

실행 workflow 

```
[Input: 회의 데이터 <- DB Retrieval 값과 조합한 데이터]
        │
        ▼
[1. 프롬프트 생성] ── prompt.py
    SYSTEM_PROMPT에 회의 스크립트, 목적, 참여자,
    이전 액션 아이템, 이전 피드백 삽입
        │
        ▼
[2. GPT-3.5 API 호출] ── analyzer.py
    OpenAI chat.completions.create()
    response_format: json_object (구조화된 JSON 반환)
        │
        ▼
[3. 품질 평가] ── evaluate.py
    BertScore(KcELECTRA-base-v2022)로
    원본 회의 스크립트 vs GPT 요약+액션아이템 유사도 비교 (Hugging Face Space API)
    지표: Precision, Recall, F1
    threshold: Recall >= 0.7
        │
    ┌───┴───┐
  PASS    FAIL
  (≥0.7)  (<0.7)
    │        │
[DB 저장]  [에러 처리]  ← 백엔드 구현 필요
```

GPT Generated Response Schema

```
{
  "summary": "회의 핵심 내용 요약 (2-3문장)",
  "action_items": [
    {
      "task": "태스크 설명",
      "priority": 1
    }
  ],
  "qualitative_feedback": "회의 효율성 평가 (2-3문장)",
  "next_agenda": ["다음 회의 안건1", "다음 회의 안건2"]
}
```
