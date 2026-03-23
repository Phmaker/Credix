from django.db import models

from api.accounts.models import Account


class Transaction(models.Model):
    TYPE_DEPOSIT = "DEPOSIT"
    TYPE_PIX = "PIX"
    TYPE_TRANSFER = "TRANSFER"
    TYPE_LOAN_CREDIT = "LOAN_CREDIT"

    TYPE_CHOICES = (
        (TYPE_DEPOSIT, "Depósito"),
        (TYPE_PIX, "PIX"),
        (TYPE_TRANSFER, "Transferência"),
        (TYPE_LOAN_CREDIT, "Crédito de empréstimo"),
    )

    source_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        related_name="outgoing_transactions",
        null=True,
        blank=True,
    )
    destination_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        related_name="incoming_transactions",
        null=True,
        blank=True,
    )
    transaction_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    external_bank_code = models.CharField(max_length=20, blank=True)
    external_agency = models.CharField(max_length=20, blank=True)
    external_account = models.CharField(max_length=30, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "transactions"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.transaction_type} - {self.amount}"
