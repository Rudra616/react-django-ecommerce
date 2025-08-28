from django.urls import path
from .views import (
    UserRegistrationView,
    UserLoginView,
    UserDetailView,
    UserLogoutView,
    ProductListCreateView,
    ProductDetailView,
    OrderListCreateView,
    OrderDetailView,
    PaymentCreateView,
    CartListCreateView, CartDetailView ,ForgotPasswordView,ResetPasswordView,ReviewListCreateView,ReviewDetailView
)

urlpatterns = [
    # User Auth
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("login/", UserLoginView.as_view(), name="login"),
    path("user/", UserDetailView.as_view(), name="user-detail"),
    path("logout/", UserLogoutView.as_view(), name="logout"),

    # Products
    path("products/", ProductListCreateView.as_view(), name="product-list-create"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),



    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),

    # Payments
    path('payments/', PaymentCreateView.as_view(), name='payment-create'),

    path('cart/', CartListCreateView.as_view(), name='cart-list-create'),
    path('cart/<int:pk>/', CartDetailView.as_view(), name='cart-detail'),


    path('password/forgot/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('password/reset/<uidb64>/<token>/', ResetPasswordView.as_view(), name='reset-password'),


    path("products/<int:product_id>/reviews/", ReviewListCreateView.as_view(), name="review-list-create"),
    path("reviews/<int:pk>/", ReviewDetailView.as_view(), name="review-detail"),

]
