from decimal import Decimal

from django.db import models

from api.customers.models import Customer


class Account(models.Model):
    customer = models.OneToOneField(Customer, on_delete=models.CASCADE, related_name="account")
    agency = models.CharField(max_length=4)
    account_number = models.CharField(max_length=8, unique=True)
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "accounts"
        indexes = [
            models.Index(fields=["agency", "account_number"]),
        ]

    def __str__(self) -> str:
        return f"{self.agency}/{self.account_number}"
