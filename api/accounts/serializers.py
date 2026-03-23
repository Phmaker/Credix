from rest_framework import serializers

from api.accounts.models import Account


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ("agency", "account_number", "balance", "created_at")
