from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.accounts.models import Account
from api.transactions.models import Transaction
from api.transactions.serializers import (
    DepositSerializer,
    ExternalTransferSerializer,
    PixSerializer,
    TransactionSerializer,
)
from core.services.transaction_service import TransactionService


class StatementView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: TransactionSerializer(many=True)})
    def get(self, request):
        account = request.user.customer.account
        records = TransactionService.statement_for_account(account)
        serializer = TransactionSerializer(records, many=True)
        return Response(serializer.data)


class DepositView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=DepositSerializer, responses={201: TransactionSerializer})
    def post(self, request):
        serializer = DepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tx = TransactionService.deposit(
            account=request.user.customer.account,
            amount=serializer.validated_data["amount"],
            description=serializer.validated_data.get("description", ""),
        )
        return Response(TransactionSerializer(tx).data, status=status.HTTP_201_CREATED)


class PixView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=PixSerializer, responses={201: TransactionSerializer})
    def post(self, request):
        serializer = PixSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_account = Account.objects.get(
            agency=serializer.validated_data["destination_agency"],
            account_number=serializer.validated_data["destination_account_number"],
        )
        tx = TransactionService.transfer_internal(
            source_account=request.user.customer.account,
            destination_account=target_account,
            amount=serializer.validated_data["amount"],
            transaction_type=Transaction.TYPE_PIX,
            description=serializer.validated_data.get("description", ""),
        )
        return Response(TransactionSerializer(tx).data, status=status.HTTP_201_CREATED)


class TransferView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=ExternalTransferSerializer, responses={201: TransactionSerializer})
    def post(self, request):
        serializer = ExternalTransferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tx = TransactionService.transfer_external(
            source_account=request.user.customer.account,
            amount=serializer.validated_data["amount"],
            bank_code=serializer.validated_data["bank_code"],
            agency=serializer.validated_data["agency"],
            account_number=serializer.validated_data["account_number"],
            description=serializer.validated_data.get("description", ""),
        )
        return Response(TransactionSerializer(tx).data, status=status.HTTP_201_CREATED)


class InternalTransferView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(request=PixSerializer, responses={201: TransactionSerializer})
    def post(self, request):
        serializer = PixSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        target_account = Account.objects.get(
            agency=serializer.validated_data["destination_agency"],
            account_number=serializer.validated_data["destination_account_number"],
        )
        tx = TransactionService.transfer_internal(
            source_account=request.user.customer.account,
            destination_account=target_account,
            amount=serializer.validated_data["amount"],
            transaction_type=Transaction.TYPE_TRANSFER,
            description=serializer.validated_data.get("description", ""),
        )
        return Response(TransactionSerializer(tx).data, status=status.HTTP_201_CREATED)
