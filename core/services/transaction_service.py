from decimal import Decimal

from django.core.cache import cache
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError

from api.accounts.models import Account
from api.transactions.models import Transaction


class TransactionService:
    @staticmethod
    def _invalidate_statement_cache(account_id: int) -> None:
        cache.delete(f"statement:{account_id}")

    @staticmethod
    @transaction.atomic
    def deposit(*, account: Account, amount: Decimal, description: str = "") -> Transaction:
        if amount <= 0:
            raise ValidationError("Valor do depósito deve ser maior que zero.")

        account.balance += amount
        account.save(update_fields=["balance"])

        transaction_obj = Transaction.objects.create(
            destination_account=account,
            transaction_type=Transaction.TYPE_DEPOSIT,
            amount=amount,
            description=description or "Depósito em conta",
        )
        TransactionService._invalidate_statement_cache(account.id)
        return transaction_obj

    @staticmethod
    @transaction.atomic
    def transfer_internal(
        *,
        source_account: Account,
        destination_account: Account,
        amount: Decimal,
        transaction_type: str,
        description: str = "",
    ) -> Transaction:
        if source_account.id == destination_account.id:
            raise ValidationError("Conta de origem e destino não podem ser iguais.")
        if amount <= 0:
            raise ValidationError("Valor deve ser maior que zero.")
        if source_account.balance < amount:
            raise ValidationError("Saldo insuficiente.")

        source_account.balance -= amount
        destination_account.balance += amount
        source_account.save(update_fields=["balance"])
        destination_account.save(update_fields=["balance"])

        transaction_obj = Transaction.objects.create(
            source_account=source_account,
            destination_account=destination_account,
            transaction_type=transaction_type,
            amount=amount,
            description=description or "Transferência interna",
        )
        TransactionService._invalidate_statement_cache(source_account.id)
        TransactionService._invalidate_statement_cache(destination_account.id)
        return transaction_obj

    @staticmethod
    @transaction.atomic
    def transfer_external(
        *,
        source_account: Account,
        amount: Decimal,
        bank_code: str,
        agency: str,
        account_number: str,
        description: str = "",
    ) -> Transaction:
        if amount <= 0:
            raise ValidationError("Valor deve ser maior que zero.")
        if source_account.balance < amount:
            raise ValidationError("Saldo insuficiente.")

        source_account.balance -= amount
        source_account.save(update_fields=["balance"])

        transaction_obj = Transaction.objects.create(
            source_account=source_account,
            transaction_type=Transaction.TYPE_TRANSFER,
            amount=amount,
            external_bank_code=bank_code,
            external_agency=agency,
            external_account=account_number,
            description=description or "Transferência para outro banco",
        )
        TransactionService._invalidate_statement_cache(source_account.id)
        return transaction_obj

    @staticmethod
    def statement_for_account(account: Account):
        cache_key = f"statement:{account.id}"
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        queryset = Transaction.objects.filter(
            Q(source_account=account) | Q(destination_account=account)
        ).select_related("source_account", "destination_account")
        records = list(queryset)
        cache.set(cache_key, records, timeout=120)
        return records
