from django.urls import path

from api.accounts.views import AccountMeView

urlpatterns = [
    path("me/", AccountMeView.as_view(), name="account-me"),
]
