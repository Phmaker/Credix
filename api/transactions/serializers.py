from rest_framework import serializers

from api.accounts.models import Account
from api.transactions.models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    source = serializers.SerializerMethodField()
    destination = serializers.SerializerMethodField()

    class Meta:
        model = Transaction
        fields = (
            "id",
            "transaction_type",
            "amount",
            "description",
            "source",
            "destination",
            "external_bank_code",
            "external_agency",
            "external_account",
            "created_at",
        )

    def _serialize_account(self, account):
        if not account:
            return None
        return {
            "agency": account.agency,
            "account_number": account.account_number,
        }

    def get_source(self, obj):
        return self._serialize_account(obj.source_account)

    def get_destination(self, obj):
        return self._serialize_account(obj.destination_account)


class DepositSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    description = serializers.CharField(required=False, allow_blank=True, max_length=255)


class PixSerializer(serializers.Serializer):
    destination_agency = serializers.CharField(max_length=4)
    destination_account_number = serializers.CharField(max_length=8)
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    description = serializers.CharField(required=False, allow_blank=True, max_length=255)

    def validate(self, attrs):
        if not Account.objects.filter(
            agency=attrs["destination_agency"],
            account_number=attrs["destination_account_number"],
        ).exists():
            raise serializers.ValidationError("Conta de destino não encontrada.")
        return attrs


class ExternalTransferSerializer(serializers.Serializer):
    bank_code = serializers.CharField(max_length=20)
    agency = serializers.CharField(max_length=20)
    account_number = serializers.CharField(max_length=30)
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
    description = serializers.CharField(required=False, allow_blank=True, max_length=255)
