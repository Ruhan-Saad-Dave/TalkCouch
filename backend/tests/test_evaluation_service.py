import pytest
import io
from unittest.mock import AsyncMock

from src.services.v2.evaluation_service import EvaluationService


@pytest.fixture
def service():
    return EvaluationService(llm_service=AsyncMock(), media_service=AsyncMock())


# ── evaluate_jumble ────────────────────────────────────────────────────────────

async def test_jumble_exact_match(service):
    _, _, accuracy, results = await service.evaluate_jumble(
        ["the cat sat on the mat"],
        ["the cat sat on the mat"],
    )
    assert results[0]["is_exact"] is True
    assert accuracy == 100.0


async def test_jumble_case_insensitive_exact(service):
    _, _, _, results = await service.evaluate_jumble(
        ["The Cat Sat"],
        ["the cat sat"],
    )
    assert results[0]["is_exact"] is True


async def test_jumble_partial_match(service):
    score, total, accuracy, results = await service.evaluate_jumble(
        ["the cat sat"],
        ["the cat ran"],
    )
    assert results[0]["is_exact"] is False
    assert 0 < accuracy < 100


async def test_jumble_empty_user_answer(service):
    _, _, accuracy, results = await service.evaluate_jumble(
        [""],
        ["the cat sat on the mat"],
    )
    assert results[0]["is_exact"] is False
    assert accuracy == 0.0


async def test_jumble_length_mismatch_safe(service):
    # More correct answers than user answers — must not raise IndexError
    _, _, _, results = await service.evaluate_jumble(
        ["hello"],
        ["hello", "world", "foo"],
    )
    assert len(results) == 1
    assert results[0]["is_exact"] is True


async def test_jumble_multiple_sentences(service):
    _, _, _, results = await service.evaluate_jumble(
        ["hello world", "foo bar"],
        ["hello world", "foo baz"],
    )
    assert results[0]["is_exact"] is True
    assert results[1]["is_exact"] is False


# ── evaluate_speech ────────────────────────────────────────────────────────────

async def test_speech_exact_match(service):
    service.media_service.transcribe_audio = AsyncMock(return_value="the quick brown fox")
    _, accuracy = await service.evaluate_speech("the quick brown fox", io.BytesIO(b"audio"))
    assert accuracy == "100.00%"


async def test_speech_punctuation_ignored(service):
    service.media_service.transcribe_audio = AsyncMock(return_value="hello world")
    _, accuracy = await service.evaluate_speech("Hello, World!", io.BytesIO(b"audio"))
    assert accuracy == "100.00%"


async def test_speech_low_similarity(service):
    service.media_service.transcribe_audio = AsyncMock(return_value="completely different words")
    _, accuracy = await service.evaluate_speech("the quick brown fox", io.BytesIO(b"audio"))
    pct = float(accuracy.replace("%", ""))
    assert pct < 50
