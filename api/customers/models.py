from django.contrib.auth.models import User
from django.db import models


class Customer(models.Model):
    DOCUMENT_CHOICES = (
        ("CPF", "CPF"),
        ("CNPJ", "CNPJ"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer")
    full_name = models.CharField(max_length=150)
    document = models.CharField(max_length=14, unique=True)
    document_type = models.CharField(max_length=4, choices=DOCUMENT_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "customers"

    def __str__(self) -> str:
        return f"{self.full_name} ({self.document_type})"
