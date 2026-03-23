from django.contrib.auth.models import User
from django.db import transaction

from api.accounts.models import Account
from api.customers.models import Customer
from core.utils.accounts import generate_account_number, generate_agency_number
from core.utils.documents import document_type, is_valid_document, normalize_document


class CustomerService:
    @staticmethod
    @transaction.atomic
    def create_customer_with_account(*, username: str, password: str, full_name: str, document: str) -> Customer:
        normalized_document = normalize_document(document)
        if not is_valid_document(normalized_document):
            raise ValueError("Documento inválido. Use CPF (11) ou CNPJ (14).")

        if Customer.objects.filter(document=normalized_document).exists():
            raise ValueError("Documento já cadastrado.")

        if User.objects.filter(username=username).exists():
            raise ValueError("Usuário já existe.")

        user = User.objects.create_user(username=username, password=password)
        customer = Customer.objects.create(
            user=user,
            full_name=full_name,
            document=normalized_document,
            document_type=document_type(normalized_document),
        )

        Account.objects.create(
            customer=customer,
            agency=generate_agency_number(),
            account_number=generate_account_number(),
        )
        return customer
