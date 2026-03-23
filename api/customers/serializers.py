from rest_framework import serializers

from api.customers.models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    agency = serializers.CharField(source="account.agency", read_only=True)
    account_number = serializers.CharField(source="account.account_number", read_only=True)
    balance = serializers.DecimalField(source="account.balance", max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Customer
        fields = (
            "id",
            "full_name",
            "document",
            "document_type",
            "agency",
            "account_number",
            "balance",
            "created_at",
        )
