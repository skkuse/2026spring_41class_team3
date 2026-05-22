import requests
import json

def evaluate_with_bert(raw_text: str, generated_text: dict) -> dict:
    # HF Space API endpoint URL (evaluate) 
    SPACE_URL = "https://jeongwoojang-MARS-evaluateBERT.hf.space/evaluate"
    ""
    payload = {
        "raw_text": raw_text,
        "generated_text": generated_text 
    }
    
    try:
        response = requests.post(SPACE_URL, json=payload, timeout=30)
        response.raise_for_status()
        return response.json() 
        """
        response body
        {"precision": ..., "recall": ..., "f1": ...} 
        """
    except Exception as e:
        print(f"HF: BERTScore API 호출 실패: {e}")
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0} # dummy data return