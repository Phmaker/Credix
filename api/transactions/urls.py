from django.urls import path

from api.transactions.views import (
    DepositView,
    InternalTransferView,
    PixView,
    StatementView,
    TransferView,
)

urlpatterns = [
    path("statement/", StatementView.as_view(), name="statement"),
    path("deposit/", DepositView.as_view(), name="deposit"),
    path("pix/", PixView.as_view(), name="pix"),
    path("transfer/internal/", InternalTransferView.as_view(), name="internal-transfer"),
    path("transfer/external/", TransferView.as_view(), name="external-transfer"),
]
