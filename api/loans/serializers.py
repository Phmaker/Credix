from rest_framework import serializers

from api.loans.models import LoanSimulation


class LoanSimulationRequestSerializer(serializers.Serializer):
    principal = serializers.DecimalField(max_digits=14, decimal_places=2)
    months = serializers.IntegerField(min_value=1, max_value=360)


class LoanSimulationSerializer(serializers.ModelSerializer):
    class Meta:
        model = LoanSimulation
        fields = (
            "id",
            "principal",
            "months",
            "monthly_interest_rate",
            "monthly_payment",
            "total_amount",
            "created_at",
        )


class LoanCreditSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=14, decimal_places=2)
