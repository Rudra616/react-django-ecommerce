from rest_framework import serializers
from django.contrib.auth import get_user_model
import re  # Regular expressions for validation
from datetime import date
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Product , Order, OrderItem, Payment, Product ,Cart,Review ,Category
User = get_user_model()

from datetime import timedelta
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


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



# serializers.py - Add password change serializer
class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        try:
            # Use Django's built-in password validation
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data

    def save(self, **kwargs):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
# ---------------- PROFILE UPDATE ----------------
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "username", "email",
            "phone_number", "date_of_birth",
            "address", "state", "district","pin_code"
        ]
        extra_kwargs = {
            "username":      {"required": True, "allow_blank": False},
            "email":         {"required": True, "allow_blank": False},
            "phone_number":  {"required": True, "allow_blank": False},
            "date_of_birth": {"required": True, "allow_null": False},
            "address":       {"required": True, "allow_blank": False},
            "state":         {"required": True, "allow_blank": False},
            "district":      {"required": True, "allow_blank": False},
            "pin_code": {"required": True, "allow_blank": False},

        }
    def validate_pin_code(self, value):
        if value and not re.fullmatch(r"\d{6}", value):
            raise serializers.ValidationError("PIN code must be 6 digits")
        return value
    def validate_email(self, value):
        user = self.instance
        value = value.lower().strip()
        
        # Allow the current user to keep their own email
        if user.email.lower() == value:
            return value
            
        # Check if email exists for other users
        if User.objects.filter(email=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("This email is already registered with another account.")
            
        return value
    # In UserProfileSerializer, modify the username validation
    def validate_username(self, value):
        user = self.instance
        if len(value) < 4 or len(value) > 20:
            raise serializers.ValidationError("Username must be between 4 and 20 characters.")
        if not value[0].isalpha():
            raise serializers.ValidationError("Username must start with a letter.")
        if not re.match(r"^[A-Za-z][A-Za-z0-9_]*$", value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        # REMOVE the uppercase requirement - this is causing issues
        # if not any(ch.isupper() for ch in value):
        #     raise serializers.ValidationError("Username must contain at least one uppercase letter.")
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

class ProductOrderSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"   # Includes all model fields





# ---------------- Order Create Serializer ----------------

# ---------------- Payment Serializer ----------------
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['amount', 'status', 'transaction_id', 'paid_at']


    def validate(self, data):
        order = data['order']
        if data['amount'] != order.total_price:
            raise serializers.ValidationError({"amount": "Payment amount must match order total."})
        return data





# In your serializers.py - Update CartSerializer
class CartSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)  # Include full product data
    product_id = serializers.IntegerField(write_only=True)  # For writing only

    class Meta:
        model = Cart
        fields = ['id', 'user', 'product', 'product_id', 'quantity']
        read_only_fields = ['user', 'product']

    def create(self, validated_data):
        # Get the product instance
        product_id = validated_data.pop('product_id')
        product = Product.objects.get(id=product_id)
        
        # Remove user if somehow it exists in validated_data
        validated_data.pop('user', None)
    
        # Get current user
        user = self.context['request'].user
    
        # Check if item already exists in cart
        try:
            cart_item = Cart.objects.get(user=user, product=product)
            cart_item.quantity += validated_data.get('quantity', 1)
            cart_item.save()
            return cart_item
        except Cart.DoesNotExist:
            return Cart.objects.create(user=user, product=product, **validated_data)
# serializers.py - Update ReviewSerializer
# In serializers.py - Update ReviewSerializer
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True)  # Add user ID
    product = serializers.PrimaryKeyRelatedField(read_only=True)
    is_current_user_review = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            "id", "user", "user_id", "user_name", "product", "rating", 
            "title", "comment", "created_at", "is_current_user_review"
        ]
        read_only_fields = ["id", "user", "user_id", "user_name", "created_at", "is_current_user_review"]

    def get_is_current_user_review(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user.id == request.user.id
        return False
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def create(self, validated_data):
        # Get user from context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    

class CategorySerializer(serializers.ModelSerializer):
    # SerializerMethodField to get first product image
    product_image = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()  
    class Meta:
        model = Category
        fields = ["id", "name", "image", "created_at", "product_image"]

    def get_product_image(self, obj):
        # Use the related_name 'products' to access all products of this category
        first_product = obj.products.first()  # Returns first Product instance or None
        if first_product and first_product.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(first_product.image.url)
            return first_product.image.url
        return None


    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)  # ✅ full URL
            return obj.image.url
        return None



# ---------------- Product Order Serializer ----------------


# ---------------- OrderItem Serializer ----------------
class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductOrderSerializer(read_only=True)  # Make sure this exists
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_image = serializers.SerializerMethodField()
    product_price = serializers.DecimalField(
        source="product.price", max_digits=10, decimal_places=2, read_only=True
    )
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "id", "product", "product_name", "product_image",
            "product_price", "quantity", "subtotal",
        ]

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None

    def get_subtotal(self, obj):
        return obj.quantity * (obj.price or obj.product.price)
# ---------------- Order Serializer ----------------
# In serializers.py - Update OrderSerializer
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "status", "total_price", "created_at", "delivery_date", 
            "items", "user", "shipping_address", "shipping_full_name",
            "shipping_phone", "shipping_address", "shipping_state",
            "shipping_district", "shipping_pin_code"
        ]

    def get_shipping_address(self, obj):
        return {
            "full_name": obj.shipping_full_name,
            "phone": obj.shipping_phone,
            "address": obj.shipping_address,
            "state": obj.shipping_state,
            "district": obj.shipping_district,
            "pin_code": obj.shipping_pin_code
        }

# ---------------- Order Create Serializer ----------------

# In serializers.py - update OrderCreateSerializer
# In serializers.py - update OrderCreateSerializer
class ShippingAddressSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255, required=False)
    phone_number = serializers.CharField(max_length=15, required=False)
    address = serializers.CharField(max_length=255, required=False)
    state = serializers.CharField(max_length=100, required=False)
    district = serializers.CharField(max_length=100, required=False)
    pin_code = serializers.CharField(max_length=10, required=False)
    
    def validate_pin_code(self, value):
        if value and not re.fullmatch(r"\d{6}", value):
            raise serializers.ValidationError("PIN code must be 6 digits")
        return value

# In serializers.py - Fix OrderCreateSerializer
class OrderCreateSerializer(serializers.ModelSerializer):
    items = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )

    class Meta:
        model = Order
        fields = ['items']

    def validate(self, data):
        items = data.get('items', [])
        
        if not items:
            raise serializers.ValidationError({"items": "At least one item is required"})
        
        validated_items = []
        for index, item in enumerate(items):
            product_id = item.get('product')
            quantity = item.get('quantity')
            
            if not product_id:
                raise serializers.ValidationError(
                    {f"items.{index}.product": "Product ID is required"}
                )
            
            if not quantity or quantity < 1:
                raise serializers.ValidationError(
                    {f"items.{index}.quantity": "Quantity must be at least 1"}
                )
            
            # Check if product exists and get the instance
            try:
                product = Product.objects.get(id=product_id)
                # Create a new dict with the product instance
                validated_items.append({
                    'product': product,  # Use the instance, not the ID
                    'quantity': quantity
                })
            except Product.DoesNotExist:
                raise serializers.ValidationError(
                    {f"items.{index}.product": f"Product with ID {product_id} does not exist"}
                )
        
        # Replace the items data with validated items containing product instances
        data['items'] = validated_items
        return data

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        user = self.context['request'].user
        
        print("Creating order for user:", user.username)
        print("Items data with product instances:", items_data)

        # Create the order
        order = Order.objects.create(user=user, status='pending')
        total_price = 0

        for item_data in items_data:
            product = item_data['product']  # This should now be a Product instance
            quantity = item_data['quantity']

            print(f"Processing item: {product.name}, quantity: {quantity}, stock: {product.stock}")

            # Stock check
            if quantity > product.stock:
                raise serializers.ValidationError(
                    {"product": f"{product.name} has only {product.stock} items left"}
                )

            # Create order item
            order_item = OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )

            # Update stock
            product.stock -= quantity
            product.save()

            total_price += product.price * quantity

        order.total_price = total_price
        order.save()

        print(f"Order created successfully: {order.id}, Total: {total_price}")
        return order

class ShippingAddressSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=255, required=False)
    phone_number = serializers.CharField(max_length=15, required=False)
    address = serializers.CharField(max_length=255, required=False)
    state = serializers.CharField(max_length=100, required=False)
    district = serializers.CharField(max_length=100, required=False)
    pin_code = serializers.CharField(max_length=10, required=False)
    
    def validate_pin_code(self, value):
        if value and not re.fullmatch(r"\d{6}", value):
            raise serializers.ValidationError("PIN code must be 6 digits")
        return value
    
