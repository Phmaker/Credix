from drf_spectacular.utils import extend_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api.customers.serializers import CustomerSerializer


class CustomerMeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(responses={200: CustomerSerializer})
    def get(self, request):
        serializer = CustomerSerializer(request.user.customer)
        return Response(serializer.data)
