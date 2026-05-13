import os
# from openai import OpenAI
from prompt import USER_INPUT
from analyzer import get_openai_response
from evaluate import evaluate_with_bert
from dotenv import load_dotenv

def main():
    test_data = {
        "meeting_script": "정우: 이번 MARS 프로젝트 AI 파트에서 GPT-4o랑 BERT 연결은 제가 맡을게요. 도현: 알겠습니다. 그럼 저는 백엔드 API랑 DB 스키마 짤게요. 아정: 저는 프론트엔드 대시보드 쪽 우선순위 시각화 구현하겠습니다. 정우: 다음 회의 전까지 각자 환경 세팅 끝내고 만나요.",
        "meeting_purpose": "프로젝트 파트 분배 및 초기 환경 세팅 논의",
        "participants": "정우, 도현, 아정, 채연",
        "prev_action_items": "없음 (첫 회의)",
        "prev_feedback": "없음"
    }   
    
    load_dotenv()
    
    gpt_response = get_openai_response(test_data)
    # gpt_response = get_openai_response(USER_INPUT)
    print(f"Output: {gpt_response}")
    
    # similarity_score = evaluate_with_bert(gpt_response, USER_INPUT)
    # print(f"Similarity Score: {similarity_score:.4f}")

if __name__ == "__main__":
    main()
