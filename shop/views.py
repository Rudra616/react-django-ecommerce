from rest_framework import generics, status ,permissions ,serializers ,filters
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.core.mail import send_mail

from .models import User, Product ,Order, Payment ,Cart
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    ProductSerializer,
    OrderSerializer,
    OrderCreateSerializer, 
    PaymentSerializer,
    CartSerializer,
    UserProfileSerializer
)

# ✅ Register User
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()  # all data fetch
    serializer_class = UserRegistrationSerializer # serilazer connect
    permission_classes = [AllowAny]  # permission

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User registered successfully",
                "user": {
                    "username": user.username,
                    "email": user.email,
                    "phone_number": user.phone_number,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Login User
class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ✅ Get / Update User Profile
class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response({
            "message": "User profile fetched successfully",
            "user": serializer.data
        }, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile updated successfully",
                "user": serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ Logout (Blacklist JWT token)
class UserLogoutView(APIView):  
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Expect the refresh token in the body
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # Adds token to blacklist
            return Response({"message": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": "Invalid token or already logged out"}, status=status.HTTP_400_BAD_REQUEST)

# ✅ Product List + Create
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # Enable filtering, searching, ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'price']  # exact match filtering
    search_fields = ['name', 'description']   # search by name/description
    ordering_fields = ['price', 'created_at'] # allow ordering
    ordering = ['-created_at']  # default ordering
    # permission_classes = [IsAuthenticated]  # Only logged-in users can add products
    

# Product Detail (Retrieve, Update, Delete)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    # permission_classes = [permissions.IsAuthenticatedOrReadOnly]

# ---------------- List & Create Orders ----------------

class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}  # pass request for user

# ---------------- Retrieve & Update Order Status ----------------

class OrderDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all()
    serializer_class = OrderSerializer


# ---------------- Payment API ----------------

class PaymentCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer

    def perform_create(self, serializer):
        order_id = self.request.data.get('order')
        if not order_id:
            raise serializers.ValidationError({"order": "This field is required."})
        try:
            order = Order.objects.get(id=order_id, user=self.request.user)
        except Order.DoesNotExist:
            raise serializers.ValidationError({"order": "Order not found or does not belong to you."})

        serializer.save(order=order)



class CartListCreateView(generics.ListCreateAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Retrieve, Update, Delete a Cart item
class CartDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)



class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)

            # Create reset token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            # Reset link for frontend
            reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"

            # Send email
            send_mail(
                subject="Password Reset Request",
                message=f"Hi {user.username},\n\nClick below to reset your password:\n{reset_link}\n\nIf you didn’t request this, ignore this email.",
                from_email="noreply@yourapp.com",
                recipient_list=[email],
            )

            return Response({"message": "Password reset email sent."}, status=200)

        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        try:
            # Decode user ID
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)

            # Validate token
            if not default_token_generator.check_token(user, token):
                return Response({"error": "Invalid or expired token"}, status=400)

            # Get new password
            new_password = request.data.get("password")
            if not new_password:
                return Response({"error": "Password is required"}, status=400)

            # Save new password
            user.set_password(new_password)
            user.save()

            return Response({"message": "Password reset successful"}, status=200)

        except Exception:
            return Response({"error": "Invalid request"}, status=400)
