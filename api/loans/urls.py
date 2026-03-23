from django.urls import path

from api.loans.views import LoanCreditView, LoanSimulationView

urlpatterns = [
    path("simulate/", LoanSimulationView.as_view(), name="loan-simulate"),
    path("credit/", LoanCreditView.as_view(), name="loan-credit"),
]
