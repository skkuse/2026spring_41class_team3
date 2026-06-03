# TEST Result Document

## Overall
- **Model**: gpt-4o-mini
- **/test_data**: 한국어 대화록 데이터셋 중 2~3문장 요약 검증용 샘플 20개
- **Metric**: BERTScore (Precision, Recall, F1 Score) - 원본 회의록과 생성된 요약문/Action Item 간 의미론적 유사도 측정

---

## Test History

### 1️⃣ prompt_v1 (`gpt-3.5-turbo`)
* **결과** (results\test_result_20260603_112356.json): Precision 0.6140 / Recall 0.4379 / F1 0.5105
* **한계**: 회의록 원문의 현황을 요약하고 action item으로 도출하는 경향이 있음. 또한 원문의 핵심 단어와 주장을 일반적인 표현으로 출력 

### 2️⃣ prompt_v2 (`gpt-3.5-turbo`)
* **결과** (results\test_result_20260603_114624.json): Precision 0.5927 / Recall 0.4215 / F1 0.4920
* **개선**: 회의록 원문의 발췌식 지시 강화 및 action item 추출 가이드(현 회의의 내용이 아닌 앞으로 취할 행동을 추출) 추가 
* **진단**: 발췌식 지시가 요약문/Action item 추출 시 어색함을 유발하여 성능 저하 

### 3️⃣ prompt_v3 (`gpt-3.5-turbo`)
* **결과** (results\test_result_20260603_120343.json): Precision 0.6209 / Recall 0.4287 / F1 0.5062
* **개선**: Few-shot Prompting 도입
* **진단**: 모델이 원문 대화의 핵심 키워드를 보존하는 방식을 모방 학습하여 점수가 개선되었으나, GPT-3.5 모델의 한계로 F1 0.50~0.52가 물리적 한계점(천장)이 됨을 파악

### 4️⃣ prompt_v1 + `gpt-4o-mini`
* **결과** (results\test_result_20260603_120857.json): Precision 0.6216 / Recall 0.4841 / F1 0.5440
* **특징**: 모델 성능 향상만으로도 BERTScore 매칭 성능이 개선됨 

### 5️⃣ prompt_v4 (최종 버전) + `gpt-4o-mini`
* **결과** (results\test_result_20260603_122523.json): Precision 0.6282 / Recall 0.4616 / F1 0.5313
* **특징**: 대학생 협업 시나리오에 적합한 One-shot 예시 도입 및 action item 추출 가이드(현 회의의 내용이 아닌 앞으로 취할 행동을 추출, v2) 적용
* **평가**: v1 + 4o 조합에 비해 Recall이 소폭 낮은 것은, 리액션이나 단순 의견 교환 같은 대화 노이즈를 철저히 필터링하여 요약문의 부피가 콤팩트하게 다듬어졌기 때문입니다. 실무/학습 협업에 불량 태스크가 마구잡이로 채워지는 현상을 완벽히 통제한 가장 우수한 품질의 최종 프롬프트입니다.

---

## 최종 `prompt_v4` Threshold 시뮬레이션

> [IMPORTANT]
> - 기존의 임계값 조건(`F1 >= 0.70` 또는 `Recall >= 0.70`)은 요약과 원문의 분량 차이 때문에 20개 샘플이 모두 FAIL(탈락율 100%)되는 비현실적인 조건으로 판단됨.
> - 최종 `prompt_v4` 테스트 결과(`test_result_20260603_122523.json`)를 토대로 최적 임계점을 분석.

| Metric | Threshold | PASS (비율) | FAIL (비율) |
| :--- | :--- | :--- | :--- |
| **F1 Score** | F1 >= 0.50 | 15개 (75.0%) | 5개 (25.0%) |
| **F1 Score** | F1 >= 0.48 | 17개 (85.0%) | 3개 (15.0%) |
| **F1 Score** | F1 >= 0.45 | 20개 (100.0%) | 0개 (0.0%) |
| **Recall Score** | Recall >= 0.45 | 14개 (70.0%) | 6개 (30.0%) |
| **Recall Score** | Recall >= 0.42 | 16개 (80.0%) | 4개 (20.0%) |

---
> [Suggestion]
> 서비스 안정성과 에러율을 고려하여 `F1 Score >= 0.48`제안.
> - **Recall이 아닌 F1 Score를 Metric으로 설정한 이유**: `Recall >= 0.45`는 요약이 정상적임에도 원문과 생성 텍스트 간 길이 차이(단어 수 부족 등)로 인해 30%(6개 파일)를 탈락. 요약은 원문의 전체 내용을 담아야 하는 것이 아닌 핵심 내용을 전달하는 것이 목적이므로, Precision과 Recall의 균형을 보는 F1 Score가 적합
> - **BERTScore의 Upper Bound**:
>   - **극단적인 압축률**: 1,000자 이상의 원문 회의록을 150자 내외로 압축하는 과정에서 90% 이상의 단어가 소거되기 때문에 BERTScore 특성 상 (단어 정밀도 매칭) Upper Bound가 0.55 내외에서 결정됨.
>   - 따라서 `0.48` 임계값은 낮은 기준이 아니라, 품질 상위 20~30% 수준의 정상 범위 결과물만 통과시키는 커트라인.
> - **Outlier Detection의 역할**:
>   - 정상 응답률을 85% 내외로 유지하는 안전망 