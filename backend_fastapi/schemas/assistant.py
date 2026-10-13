from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

class ChatMessagePart(BaseModel):
    text: str

class ChatHistoryTurn(BaseModel):
    role: Literal['user', 'model', 'assistant']
    parts: Optional[List[ChatMessagePart]] = None
    content: Optional[str] = None

class MultiTurnChatRequest(BaseModel):
    message: str = Field(..., description="Current user prompt")
    history: Optional[List[ChatHistoryTurn]] = Field(default=[], description="Previous conversation turns")
    role: Optional[Literal['quant', 'risk', 'trader', 'mentor']] = Field(default='quant', description="Assistant persona role")
    model: Optional[str] = Field(default='gemini-3.8-flash', description="Gemini model to use")

class MultiTurnChatResponse(BaseModel):
    reply: str
    isAiPowered: bool
    modelUsed: str
    role: str
    timestamp: str
    disclaimer: str
    contextData: Optional[Dict[str, Any]] = None
