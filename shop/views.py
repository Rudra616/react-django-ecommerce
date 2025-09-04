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
from django.conf import settings
from .utils import send_verification_email
from django.db.models import Prefetch

from .models import User, Product ,Order, Payment ,Cart ,Review ,Category,OrderItem
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    ProductSerializer,
    OrderSerializer,
    OrderCreateSerializer, 
    PaymentSerializer,
    CartSerializer,
    UserProfileSerializer,
    ReviewSerializer,
    CategorySerializer
)

# ✅ Register User

class EmailVerificationView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)

            if not default_token_generator.check_token(user, token):
                return Response({"error": "Invalid or expired link"}, status=400)

            user.is_active = True
            user.save()
            return Response({"message": "Email verified successfully"}, status=200)

        except Exception:
            return Response({"error": "Invalid request"}, status=400)

class OrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]  # 👈 This requires login

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        status_value = request.data.get("status")

        if status_value not in dict(Order.STATUS_CHOICES):
            return Response({"error": "Invalid status"}, status=400)

        order.status = status_value
        order.save()
        return Response({"message": f"Order status updated to {status_value}"}, status=200)


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False  # ✅ block login until email verified
            user.save()
            send_verification_email(user)
            return Response({"message": "User registered successfully. Please verify your email."}, status=201)
        return Response(serializer.errors, status=400)

# ✅ Login User
class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


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
    permission_classes = []  # no auth required

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=400)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=205)
        except Exception:
            return Response({"error": "Invalid token or already logged out"}, status=400)


# ✅ Product List + Create
class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Enable filtering, searching, ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'price']  # exact match filtering
    search_fields = ['name', 'description']   # search by name/description
    ordering_fields = ['price', 'created_at'] # allow ordering
    ordering = ['-created_at']  # default ordering
    # permission_classes = [IsAuthenticated]  # Only logged-in users can add products
    
    def get_permissions(self):
        if self.request.method == "POST":
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
# Product Detail (Retrieve, Update, Delete)

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]



# ---------------- List & Create Orders ----------------
class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        # Prefetch related items and products to avoid N+1 queries
        return self.queryset.filter(user=self.request.user).prefetch_related(
            Prefetch('items', queryset=OrderItem.objects.select_related('product'))
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

# ---------------- Retrieve & Update Order Status ----------------
class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Prefetch related items and products
        return Order.objects.filter(user=self.request.user).prefetch_related(
            Prefetch('items', queryset=OrderItem.objects.select_related('product'))
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


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



# shop/views.py - Update CartListCreateView
class CartListCreateView(generics.ListCreateAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        quantity = int(request.data.get('quantity', 1))
        
        try:
            # Check if item already exists in cart
            cart_item = Cart.objects.get(user=request.user, product_id=product_id)
            # Update quantity if item exists
            cart_item.quantity += quantity
            cart_item.save()
            serializer = self.get_serializer(cart_item)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Cart.DoesNotExist:
            # Create new cart item if it doesn't exist
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)    
# Retrieve, Update, Delete a Cart item
class CartDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)



class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]  # ✅ Allow anyone to call this endpoint

    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.filter(email=email).first()
            if not user:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
    
            # Create reset token
            uid = urlsafe_base64_encode(force_bytes(user.id))
            token = default_token_generator.make_token(user)
    
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
    
            send_mail(
                subject="Password Reset Request",
                message=f"Hi {user.username},\n\nClick here to reset your password:\n{reset_link}",
                from_email="noreply@yourapp.com",
                recipient_list=[email],
            )
    
            return Response({"message": "Password reset email sent."}, status=200)
    
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
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





# shop/views.py - Update permission classes
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]  # Anyone can read reviews
        return [permissions.IsAuthenticated()]  # Only authenticated users can create reviews

    def get_queryset(self):
        product_id = self.kwargs["product_id"]
        return Review.objects.filter(product_id=product_id)
    
    def perform_create(self, serializer):
        product_id = self.kwargs["product_id"]
        user = self.request.user
        
        # Check for existing review
        existing_review = Review.objects.filter(user=user, product_id=product_id).first()
        if existing_review:
            raise serializers.ValidationError({"detail": "You have already reviewed this product."})
        
        serializer.save(user=user, product_id=product_id)
class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        #Decide which records to fetch from DB (filtering).
        return Review.objects.filter(user=self.request.user)


# ✅ List all categories
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all().order_by("-created_at")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

# ✅ Get products by category
class CategoryProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        category_id = self.kwargs["pk"]
        return Product.objects.filter(category_id=category_id).order_by("-created_at")
