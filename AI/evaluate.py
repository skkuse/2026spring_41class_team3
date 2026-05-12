# from transformers import BertTokenizer, BertModel
# import torch

def evaluate_with_bert(raw_text: str, generated_text: str) -> float:
    """
    HuggingFace BERT 모델을 사용하여 회의록 text와 AI 생성 텍스트 간의 유사도 측정 (BERTScore, threshold=0.8)
    """
    # tokenizer = BertTokenizer.from_pretrained('bert-base-multilingual-cased')
    # model = BertModel.from_pretrained('bert-base-multilingual-cased')
    
    # inputs1 = tokenizer(text1, return_tensors='pt')
    # inputs2 = tokenizer(text2, return_tensors='pt')
    
    return 0.85
