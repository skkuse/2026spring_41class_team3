import os
# from openai import OpenAI
from analyzer import get_openai_response
from evaluate import evaluate_with_bert
from dotenv import load_dotenv

def main():
    # TODO: DB에서 데이터 조회 로직으로 변경 (format은 test_data와 같음)
    test_data = {
        "meeting_script": "정우: 이번 MARS 프로젝트 AI 파트에서 GPT-4o랑 BERT 연결은 제가 맡을게요. 도현: 알겠습니다. 그럼 저는 백엔드 API랑 DB 스키마 짤게요. 아정: 저는 프론트엔드 대시보드 쪽 우선순위 시각화 구현하겠습니다. 정우: 다음 회의 전까지 각자 환경 세팅 끝내고 만나요.",
        "meeting_purpose": "프로젝트 파트 분배 및 초기 환경 세팅 논의",
        "participants": "정우, 도현, 아정, 채연",
        "prev_action_items": "없음 (첫 회의)",
        "prev_feedback": "없음"
    }   
    
    # 환경변수 load
    load_dotenv()
    
    # gpt 호출 및 output 반환
    gpt_response = get_openai_response(test_data)
    print(f"Output: {gpt_response}")
    
    # gpt output과 원본 text 유사도 평가
    bert_score = evaluate_with_bert(test_data["meeting_script"], gpt_response) 
    print(f"- Precision: {bert_score['precision']:.4f}")
    print(f"- Recall: {bert_score['recall']:.4f}")
    print(f"- F1 Score: {bert_score['f1']:.4f}")

    # bert score (treshold 0.7 이상 통과)
    ## PASS 시 - DB 저장 로직 추가 필요
    ## FAIL 시 - API Error handling 필요
    if bert_score['f1'] >= 0.7:
        print("PASS: BertScore is above the threshold of 0.7")
        return gpt_response
    else:
        print("FAIL: BertScore is below the threshold of 0.7")
        return None

if __name__ == "__main__":
    main()
