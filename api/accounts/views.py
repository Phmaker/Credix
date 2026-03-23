from django.core.cache import cache
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.accounts.serializers import AccountSerializer


class AccountMeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: AccountSerializer})
    def get(self, request):
        account = request.user.customer.account
        cache_key = f"account:me:{account.id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        data = AccountSerializer(account).data
        cache.set(cache_key, data, timeout=60)
        return Response(data)
