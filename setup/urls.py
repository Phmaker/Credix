from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/v1/auth/", include("api.authentication.urls")),
    path("api/v1/customers/", include("api.customers.urls")),
    path("api/v1/accounts/", include("api.accounts.urls")),
    path("api/v1/transactions/", include("api.transactions.urls")),
    path("api/v1/loans/", include("api.loans.urls")),
]
