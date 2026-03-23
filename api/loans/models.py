from django.db import models

from api.accounts.models import Account


class LoanSimulation(models.Model):
    account = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="loan_simulations")
    principal = models.DecimalField(max_digits=14, decimal_places=2)
    months = models.PositiveIntegerField()
    monthly_interest_rate = models.DecimalField(max_digits=5, decimal_places=4)
    monthly_payment = models.DecimalField(max_digits=14, decimal_places=2)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "loan_simulations"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Simulação {self.account_id} - {self.principal}"
