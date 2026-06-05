from fastapi import HTTPException


class MeetingNotFoundException(HTTPException):
    def __init__(self, meeting_id=None):
        detail = f"회의를 찾을 수 없습니다: {meeting_id}" if meeting_id else "회의를 찾을 수 없습니다."
        super().__init__(status_code=404, detail=detail)


class GPTCallException(HTTPException):
    def __init__(self, detail: str = "OpenAI API 호출에 실패했습니다."):
        super().__init__(status_code=502, detail=detail)


class GPTResponseParseException(HTTPException):
    def __init__(self, detail: str = "GPT 응답 JSON 파싱에 실패했습니다."):
        super().__init__(status_code=500, detail=detail)


BERT_f1_THRESHOLD = 0.48

class AnalysisQualityError(HTTPException):
    def __init__(self, f1: float):
        super().__init__(
            status_code=422,
            detail=f"BERTScore f1({f1:.4f})이 기준({BERT_f1_THRESHOLD}) 미달입니다. 재분석을 요청해주세요.",
        )


class HFSpaceConnectionException(HTTPException):
    def __init__(self, detail: str = "Hugging Face Space 통신에 실패했습니다."):
        super().__init__(status_code=504, detail=detail)


class DatabaseSaveException(HTTPException):
    def __init__(self, detail: str = "DB 저장에 실패했습니다."):
        super().__init__(status_code=500, detail=detail)
