from rest_framework import serializers

from core.services.customer_service import CustomerService


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(max_length=150)
    document = serializers.CharField(max_length=18)

    def create(self, validated_data):
        return CustomerService.create_customer_with_account(**validated_data)
