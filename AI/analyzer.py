import os
from openai import OpenAI
from prompt import SYSTEM_PROMPT

def get_openai_response(user_input: str) -> str:
    """
    OpenAI API 호출, text 생성 
    """
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    formatted_prompt = SYSTEM_PROMPT.format(
        meeting_script=user_input["meeting_script"],
        meeting_purpose=user_input["meeting_purpose"],
        participants=user_input["participants"],
        prev_action_items=user_input.get("prev_action_items", "N/A"),
        prev_feedback=user_input.get("prev_feedback", "N/A")
    )

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": "Please analyze the meeting based on the instructions."}
        ],
        response_format={"type": "json_object"}
    )
    return response.choices[0].message.content