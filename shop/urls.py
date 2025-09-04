# shop/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    # User Auth
    UserRegistrationView, UserLoginView, UserDetailView, UserLogoutView,
    EmailVerificationView, ForgotPasswordView, ResetPasswordView,

    # Products & Categories
    ProductListCreateView, ProductDetailView,
    CategoryListView, CategoryProductListView,

    # Orders
    OrderListCreateView, OrderDetailView, OrderStatusUpdateView,

    # Cart
    CartListCreateView, CartDetailView,

    # Payments
    PaymentCreateView,

    # Reviews
    ReviewListCreateView, ReviewDetailView,
)

urlpatterns = [
    # ------------------ AUTH ------------------
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("user/", UserDetailView.as_view(), name="user-detail"),
    path("logout/", UserLogoutView.as_view(), name="logout"),
    path("verify-email/<uidb64>/<token>/", EmailVerificationView.as_view(), name="verify-email"),
    path("password/forgot/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("password/reset/<uidb64>/<token>/", ResetPasswordView.as_view(), name="reset-password"),

    # ------------------ PRODUCTS ------------------
    path("products/", ProductListCreateView.as_view(), name="product-list-create"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),

    # ------------------ CATEGORIES ------------------
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/<int:pk>/products/", CategoryProductListView.as_view(), name="category-products"),

    # ------------------ ORDERS ------------------
    path("orders/", OrderListCreateView.as_view(), name="order-list-create"),
    path("orders/<int:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("orders/<int:pk>/status/", OrderStatusUpdateView.as_view(), name="order-status-update"),

    # ------------------ CART ------------------
    path("cart/", CartListCreateView.as_view(), name="cart-list-create"),
    path("cart/<int:pk>/", CartDetailView.as_view(), name="cart-detail"),

    # ------------------ PAYMENTS ------------------
    path("payments/", PaymentCreateView.as_view(), name="payment-create"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # ------------------ REVIEWS ------------------
    path("products/<int:product_id>/reviews/", ReviewListCreateView.as_view(), name="review-list-create"),
    path("reviews/<int:pk>/", ReviewDetailView.as_view(), name="review-detail"),
]
