import os
# from openai import OpenAI
from prompt import SYSTEM_PROMPT, USER_INPUT
from evaluate import evaluate_with_bert

def get_openai_response(user_input: str) -> str:
    """
    OpenAI API 호출, text 생성 
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_input}
        ],
    )
    return response.choices[0].message.content

def main():
    gpt_response = get_openai_response(USER_INPUT)
    print(f"Output: {gpt_response}")
    
    similarity_score = evaluate_with_bert(gpt_response, USER_INPUT)
    print(f"Similarity Score: {similarity_score:.4f}")

if __name__ == "__main__":
    main()
