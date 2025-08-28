from rest_framework import serializers
from django.contrib.auth import get_user_model
import re  # Regular expressions for validation
from datetime import date
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Product , Order, OrderItem, Payment, Product ,Cart,Review
User = get_user_model()



import re
from datetime import date
from rest_framework import serializers
from .models import User


# ==================== USER REGISTRATION ====================
import re
from datetime import date
from rest_framework import serializers
from .models import User


import re
from datetime import date
from rest_framework import serializers
from .models import User


# ---------------- REGISTER ----------------
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "username", "email", "password", "confirm_password",
            "phone_number", "date_of_birth", "address", "state", "district",
        ]
        # Make everything required; disallow null/blank where applicable
        extra_kwargs = {
            "username":      {"required": True, "allow_blank": False},
            "email":         {"required": True, "allow_blank": False},
            "password":      {"required": True},
            "confirm_password": {"required": True},
            "phone_number":  {"required": True, "allow_blank": False},
            "date_of_birth": {"required": True, "allow_null": False},
            "address":       {"required": True, "allow_blank": False},
            "state":         {"required": True, "allow_blank": False},
            "district":      {"required": True, "allow_blank": False},
        }

    # Email
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    # Username
    def validate_username(self, value):
        if len(value) < 4 or len(value) > 20:
            raise serializers.ValidationError("Username must be between 4 and 20 characters.")
        if not value[0].isalpha():
            raise serializers.ValidationError("Username must start with a letter.")
        if not re.match(r"^[A-Za-z][A-Za-z0-9_]*$", value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        if not any(ch.isupper() for ch in value):
            raise serializers.ValidationError("Username must contain at least one uppercase letter.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    # Password
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", value):
            raise serializers.ValidationError("Password must contain at least one number.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value

    # DOB (guard against None)
    def validate_date_of_birth(self, value):
        if value is None:
            raise serializers.ValidationError("Date of birth is required (format YYYY-MM-DD).")
        age = (date.today() - value).days // 365
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old.")
        return value

    # Phone (exactly 10 digits)
    def validate_phone_number(self, value):
        if not re.fullmatch(r"\d{10}", value or ""):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

    # Address/State/District
    def validate_address(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Address is required and cannot be blank.")
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Address must be at least 5 characters long.")
        return value

    def validate_state(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("State is required.")
        return value

    def validate_district(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("District is required.")
        return value

    # Cross-field
    def validate(self, attrs):
        if attrs.get("password") != attrs.get("confirm_password"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        return User.objects.create_user(**validated_data)


# ---------------- PROFILE UPDATE ----------------
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username", "email",
            "phone_number", "date_of_birth",
            "address", "state", "district",
        ]
        extra_kwargs = {
            "username":      {"required": True, "allow_blank": False},
            "email":         {"required": True, "allow_blank": False},
            "phone_number":  {"required": True, "allow_blank": False},
            "date_of_birth": {"required": True, "allow_null": False},
            "address":       {"required": True, "allow_blank": False},
            "state":         {"required": True, "allow_blank": False},
            "district":      {"required": True, "allow_blank": False},
        }

    def validate_email(self, value):
        user = self.instance
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_username(self, value):
        user = self.instance
        if len(value) < 4 or len(value) > 20:
            raise serializers.ValidationError("Username must be between 4 and 20 characters.")
        if not value[0].isalpha():
            raise serializers.ValidationError("Username must start with a letter.")
        if not re.match(r"^[A-Za-z][A-Za-z0-9_]*$", value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        if not any(ch.isupper() for ch in value):
            raise serializers.ValidationError("Username must contain at least one uppercase letter.")
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_date_of_birth(self, value):
        if value is None:
            raise serializers.ValidationError("Date of birth is required (format YYYY-MM-DD).")
        age = (date.today() - value).days // 365
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old.")
        return value

    def validate_phone_number(self, value):
        if not re.fullmatch(r"\d{10}", value or ""):
            raise serializers.ValidationError("Phone number must be exactly 10 digits.")
        return value

    def validate_address(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("Address is required and cannot be blank.")
        if len(value.strip()) < 5:
            raise serializers.ValidationError("Address must be at least 5 characters long.")
        return value
    
    def validate_state(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("State is required.")
        return value
    
    def validate_district(self, value):
        if value is None or not value.strip():
            raise serializers.ValidationError("District is required.")
        return value
    
class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError("Invalid username or password")

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'username': user.username,
                'email': user.email,
                'phone_number': user.phone_number,
                'date_of_birth' : user.date_of_birth
            }
        }



class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"   # Includes all model fields




# ---------------- OrderItem Serializer ----------------
class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['product', 'quantity']



# ---------------- Payment Serializer ----------------
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

    def validate(self, data):
        order = data['order']
        if data['amount'] != order.total_price:
            raise serializers.ValidationError({"amount": "Payment amount must match order total."})
        return data

# ---------------- Order Serializer ----------------
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_price', 'status']


# ---------------- Order Create Serializer ----------------
class OrderCreateSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'items', 'total_price', 'status']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user
        order = Order.objects.create(user=user, **validated_data)

        total_price = 0
        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']

            # stock check
            if quantity > product.stock:
                raise serializers.ValidationError(
                    {"product": f"{product.name} has only {product.stock} items left"}
                )

            # create order item
            OrderItem.objects.create(order=order, product=product, quantity=quantity)

            # update stock
            product.stock -= quantity
            product.save()

            total_price += product.price * quantity

        order.total_price = total_price
        order.save()
        return order




class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ['id', 'user', 'product', 'quantity']
        read_only_fields = ['user']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)
    






class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only= True)
    product = serializers.PrimaryKeyRelatedField(read_only=True)  # ✅ add this

    class Meta:
        model = Review
        fields = ["id", "user", "product", "rating", "comment", "created_at"]
        read_only_fields = ["id", "user", "created_at"]
