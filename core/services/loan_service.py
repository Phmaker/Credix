from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from rest_framework.exceptions import ValidationError

from api.accounts.models import Account
from api.loans.models import LoanSimulation
from api.transactions.models import Transaction
from core.services.transaction_service import TransactionService


class LoanService:
    DEFAULT_MONTHLY_RATE = Decimal("0.0250")

    @staticmethod
    def _calculate_installment(principal: Decimal, months: int, monthly_rate: Decimal) -> Decimal:
        if months <= 0:
            raise ValidationError("Prazo deve ser maior que zero.")
        if principal <= 0:
            raise ValidationError("Valor do empréstimo deve ser maior que zero.")

        rate = monthly_rate
        if rate == 0:
            payment = principal / months
        else:
            payment = principal * (rate * (1 + rate) ** months) / (((1 + rate) ** months) - 1)
        return payment.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @staticmethod
    @transaction.atomic
    def simulate_and_store(account: Account, principal: Decimal, months: int) -> LoanSimulation:
        monthly_payment = LoanService._calculate_installment(
            principal=principal,
            months=months,
            monthly_rate=LoanService.DEFAULT_MONTHLY_RATE,
        )
        total_amount = (monthly_payment * months).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        return LoanSimulation.objects.create(
            account=account,
            principal=principal,
            months=months,
            monthly_interest_rate=LoanService.DEFAULT_MONTHLY_RATE,
            monthly_payment=monthly_payment,
            total_amount=total_amount,
        )

    @staticmethod
    @transaction.atomic
    def credit_loan(account: Account, amount: Decimal) -> Transaction:
        if amount <= 0:
            raise ValidationError("Valor do crédito deve ser maior que zero.")
        return TransactionService.deposit(account=account, amount=amount, description="Crédito de empréstimo")
