from django.urls import path

from api.customers.views import CustomerMeView

urlpatterns = [
    path("me/", CustomerMeView.as_view(), name="customer-me"),
]
