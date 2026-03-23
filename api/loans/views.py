from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.loans.serializers import (
    LoanCreditSerializer,
    LoanSimulationRequestSerializer,
    LoanSimulationSerializer,
)
from api.transactions.serializers import TransactionSerializer
from core.services.loan_service import LoanService


class LoanSimulationView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=LoanSimulationRequestSerializer, responses={201: LoanSimulationSerializer})
    def post(self, request):
        serializer = LoanSimulationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        simulation = LoanService.simulate_and_store(
            account=request.user.customer.account,
            principal=serializer.validated_data["principal"],
            months=serializer.validated_data["months"],
        )
        return Response(LoanSimulationSerializer(simulation).data, status=status.HTTP_201_CREATED)


class LoanCreditView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=LoanCreditSerializer, responses={201: TransactionSerializer})
    def post(self, request):
        serializer = LoanCreditSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        transaction_obj = LoanService.credit_loan(
            account=request.user.customer.account,
            amount=serializer.validated_data["amount"],
        )
        return Response(TransactionSerializer(transaction_obj).data, status=status.HTTP_201_CREATED)
