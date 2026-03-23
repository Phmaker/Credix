import re


def normalize_document(document: str) -> str:
    return re.sub(r"\D", "", document or "")


def is_valid_document(document: str) -> bool:
    normalized = normalize_document(document)
    return len(normalized) in (11, 14)


def document_type(document: str) -> str:
    normalized = normalize_document(document)
    if len(normalized) == 11:
        return "CPF"
    if len(normalized) == 14:
        return "CNPJ"
    return "UNKNOWN"
