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
from .utils import send_verification_email,send_password_change_confirmation
from django.db.models import Prefetch
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.contrib.auth import update_session_auth_hash
from rest_framework.exceptions import PermissionDenied
import stripe
from django.http import JsonResponse

from django.utils import timezone


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
    CategorySerializer,
    PasswordChangeSerializer
)
from django.views.decorators.csrf import csrf_exempt

# ✅ Register User

@method_decorator(csrf_exempt, name='dispatch')
class EmailVerificationView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []  # ✅ Explicitly disable authentication
    
    def get(self, request, uidb64, token):
        try:
            print(f"Verifying email: uidb64={uidb64}, token={token}")
            
            # Decode the user ID
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
            
            print(f"Found user: {user.username}")

            if not default_token_generator.check_token(user, token):
                print("Token validation failed")
                return Response({"error": "Invalid or expired verification link"}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user is already active
            if user.is_active:
                print("User already active")
                return Response({"message": "Email is already verified"}, status=status.HTTP_200_OK)

            # Activate the user
            user.is_active = True
            user.save()
            print("User activated successfully")
            
            return Response({"message": "Email verified successfully"}, status=status.HTTP_200_OK)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
            print(f"Error during verification: {e}")
            return Response({"error": "Invalid verification link"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return Response({"error": "An error occurred during verification"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



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



class EmailChangeVerificationView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, uidb64, token, new_email_b64):
        try:
            # Decode user ID and new email
            uid = urlsafe_base64_decode(uidb64).decode()
            new_email = urlsafe_base64_decode(new_email_b64).decode()
            
            user = User.objects.get(pk=uid)
            
            # Verify the token
            if not default_token_generator.check_token(user, token):
                return Response({
                    "success": False,
                    "error": "Invalid or expired verification link."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if new email is already taken
            if User.objects.filter(email=new_email).exclude(pk=user.id).exists():
                return Response({
                    "success": False,
                    "error": "This email is already registered with another account."
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Update user email
            user.email = new_email
            user.is_active = True  # Ensure user is active
            user.save()
            
            return Response({
                "success": True,
                "message": "Email updated successfully! You can now login with your new email address."
            }, status=status.HTTP_200_OK)
            
        except (UnicodeDecodeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                "success": False,
                "error": "Invalid verification link."
            }, status=status.HTTP_400_BAD_REQUEST)

# ✅ Get / Update User Profile
# In UserDetailView, update the retrieve method
class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "user": serializer.data,
            "message": "User profile retrieved successfully"
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        user = self.get_object()
        new_email = request.data.get('email', '').lower().strip()
        old_email = user.email
        
        # Remove email from data if it's the same as current
        if new_email == old_email:
            request_data = request.data.copy()
            request_data.pop('email', None)
            serializer = self.get_serializer(user, data=request_data, partial=partial)
        else:
            serializer = self.get_serializer(user, data=request.data, partial=partial)
        
        if serializer.is_valid():
            # Save all fields except email first
            if new_email == old_email:
                serializer.save()
                return Response({
                    "success": True,
                    "message": "Profile updated successfully",
                    "user": serializer.data
                }, status=status.HTTP_200_OK)
            else:
                # Send verification email for email change
                from .utils import send_email_change_verification
                serializer.save()
                send_email_change_verification(user, new_email)
                
                return Response({
                    "success": True,
                    "message": "Profile updated successfully! Verification email sent.",
                    "user": serializer.data,
                    "email_verification_sent": True
                }, status=status.HTTP_200_OK)
        
        # Return proper error format
        error_messages = []
        for field, errors in serializer.errors.items():
            if isinstance(errors, list):
                error_messages.extend([f"{field}: {error}" for error in errors])
            else:
                error_messages.append(f"{field}: {errors}")
        
        return Response({
            "success": False,
            "errors": error_messages,
            "fieldErrors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Update session auth hash to prevent logout
            update_session_auth_hash(request, user)
            
            # Send password change confirmation email
            try:
                send_password_change_confirmation(user)
            except Exception as e:
                # Log the error but don't fail the password change operation
                print(f"Failed to send password change email: {e}")
                # You can use proper logging here:
                # import logging
                # logger = logging.getLogger(__name__)
                # logger.error(f"Password change email failed: {e}")
            
            return Response({
                "message": "Password changed successfully"
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
    permission_classes = [IsAuthenticated]



# ---------------- List & Create Orders ----------------
# In views.py - update OrderListCreateView
# In views.py - add detailed debugging
# In views.py - update OrderListCreateView
# In views.py - Update OrderListCreateView
# In views.py - Update OrderListCreateView
class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related(
            Prefetch('items', queryset=OrderItem.objects.select_related('product'))
        ).order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

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

# In views.py - Update PaymentCreateView

# Add PaymentListView for retrieving payments
class PaymentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        order_id = self.request.query_params.get('order')
        if order_id:
            return Payment.objects.filter(order_id=order_id, order__user=self.request.user)
        return Payment.objects.filter(order__user=self.request.user)

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


# views.py - Update ReviewListCreateView
# views.py - Update ReviewListCreateView
class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        product_id = self.kwargs["product_id"]
        product = get_object_or_404(Product, id=product_id)
        return Review.objects.filter(product_id=product_id).select_related('user')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        product_id = self.kwargs["product_id"]
        user = self.request.user
        
        # Verify product exists
        product = get_object_or_404(Product, id=product_id)
        
        # Check for existing review
        existing_review = Review.objects.filter(user=user, product_id=product_id).first()
        if existing_review:
            # Return the existing review in the response
            raise ValidationError({
                "detail": "You have already reviewed this product.",
                "existing_review": ReviewSerializer(existing_review, context={'request': self.request}).data
            })
        
        serializer.save(product=product)

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as e:
            error_data = e.detail
            if isinstance(error_data, dict) and 'existing_review' in error_data:
                return Response(
                    error_data,
                    status=status.HTTP_400_BAD_REQUEST
                )
            return Response(
                {"error": "You have already reviewed this product.", "detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
# In views.py - Update ReviewDetailView
from rest_framework.exceptions import PermissionDenied

class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only access their own reviews for modification
        return Review.objects.filter(user=self.request.user)
    
    def get_object(self):
        # Get the review and check ownership
        review = super().get_object()
        if review.user != self.request.user:
            raise PermissionDenied("You can only modify your own reviews.")
        return review
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





# Add these imports at the top of views.py
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse

# Update the PaymentCreateView to handle different payment methods
class PaymentCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PaymentSerializer

    def create(self, request, *args, **kwargs):
        order_id = request.data.get('order')
        payment_method = request.data.get('payment_method', 'card')

        if not order_id:
            return Response({"order": "This field is required."}, status=400)

        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({"order": "Order not found or does not belong to you."}, status=404)

        # Handle different payment methods
        if payment_method == 'card':
            # 💳 Create Stripe PaymentIntent for card payments
            try:
                intent = stripe.PaymentIntent.create(
                    amount=int(order.total_price * 100),  # cents
                    currency=settings.STRIPE_CURRENCY,
                    payment_method_types=['card'],
                    metadata={
                        "order_id": order.id, 
                        "user_id": request.user.id,
                        "user_email": request.user.email
                    },
                )
            except stripe.error.StripeError as e:
                return Response({"error": str(e)}, status=400)

            payment = Payment.objects.create(
                order=order,
                amount=order.total_price,
                payment_method=payment_method,
                status='pending',
                transaction_id=intent["id"],
            )

            return Response({
                "payment_id": payment.id,
                "order_id": order.id,
                "amount": str(order.total_price),
                "status": payment.status,
                "client_secret": intent.client_secret,
                "publishable_key": settings.STRIPE_PUBLISHABLE_KEY
            }, status=201)
        
        elif payment_method == 'cod':
            # Handle Cash on Delivery
            payment = Payment.objects.create(
                order=order,
                amount=order.total_price,
                payment_method=payment_method,
                status='pending',  # Will be marked as completed when order is delivered
                transaction_id=f"COD-{order.id}-{timezone.now().timestamp()}"
            )
            
            # For COD, we can mark the payment as pending but order can proceed
            return Response({
                "payment_id": payment.id,
                "order_id": order.id,
                "amount": str(order.total_price),
                "status": payment.status,
                "message": "Cash on Delivery order placed successfully"
            }, status=201)
        
        else:
            return Response({"error": "Unsupported payment method"}, status=400)

# Add a view to confirm payment completion
class PaymentConfirmView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        payment_id = request.data.get('payment_id')
        
        try:
            payment = Payment.objects.get(id=payment_id, order__user=request.user)
            
            if payment.payment_method == 'card':
                # Verify the payment with Stripe
                try:
                    intent = stripe.PaymentIntent.retrieve(payment.transaction_id)
                    
                    if intent.status == 'succeeded':
                        payment.status = 'completed'
                        payment.paid_at = timezone.now()
                        payment.save()
                        
                        # Update order status
                        payment.order.status = 'processing'
                        payment.order.save()
                        
                        return Response({
                            "status": "success",
                            "message": "Payment confirmed successfully",
                            "payment_status": payment.status
                        })
                    else:
                        return Response({
                            "status": "failed",
                            "message": f"Payment not completed: {intent.status}"
                        }, status=400)
                        
                except stripe.error.StripeError as e:
                    return Response({"error": str(e)}, status=400)
            
            elif payment.payment_method == 'cod':
                # For COD, we just confirm the order is placed
                return Response({
                    "status": "success",
                    "message": "COD order confirmed",
                    "payment_status": payment.status
                })
                
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found"}, status=404)

# Complete the webhook handler
@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        return HttpResponse(status=400)

    # ✅ Handle payment success
    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        payment = Payment.objects.filter(transaction_id=intent['id']).first()
        if payment:
            payment.status = "completed"
            payment.paid_at = timezone.now()
            payment.save()
            
            # Update order status
            payment.order.status = "processing"
            payment.order.save()

    # ✅ Handle payment failed
    elif event['type'] == 'payment_intent.payment_failed':
        intent = event['data']['object']
        payment = Payment.objects.filter(transaction_id=intent['id']).first()
        if payment:
            payment.status = "failed"
            payment.save()
            
            # Update order status to cancelled if payment fails
            payment.order.status = "cancelled"
            payment.order.save()

    return HttpResponse(status=200)