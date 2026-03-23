import random

from api.accounts.models import Account


def generate_agency_number() -> str:
    return f"{random.randint(1000, 9999)}"


def generate_account_number() -> str:
    while True:
        number = f"{random.randint(100000, 999999)}-{random.randint(0, 9)}"
        if not Account.objects.filter(account_number=number).exists():
            return number
