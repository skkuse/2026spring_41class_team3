import torch
from bert_score import score

def evaluate_with_bert(raw_text: str, generated_text: str, model_path="beomi/KcELECTRA-base-v2022") -> float:
    # gpt 답변 중 action item과 summary를 결합하여 유사도 평가
    action_items = " ".join([item['task'] for item in generated_text['action_items']])
    gen = [f"{generated_text['summary']} {action_items}"]
    
    raw = [raw_text]

    # GPU 사용 가능 여부 확인
    device = "cuda" if torch.cuda.is_available() else "cpu"

    # BertScore 점수 계산
    P, R, F1 = score(gen, raw, model_type=model_path, lang="ko", device=device, verbose=False, num_layers=9)

    # f1을 최종 BertScore 지표로 활용, threshold=0.7
    return {
        "precision": P.item(),
        "recall": R.item(),
        "f1": F1.item()
    }

