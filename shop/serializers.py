from rest_framework import serializers
from django.contrib.auth import get_user_model
import re  # Regular expressions for validation
from datetime import date
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import Product , Order, OrderItem, Payment, Product ,Cart
User = get_user_model()


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'phone_number', 'date_of_birth']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_password(self, value):
        # Strong password: min 8 chars, at least one number, one letter
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Za-z]', value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        return value

    def validate(self, data):
        # confirm password
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords do not match."})

        # phone number validation
        if not re.match(r'^\+?\d{10,15}$', data.get('phone_number', '')):
            raise serializers.ValidationError({"phone_number": "Invalid phone number format."})

        # age validation (>=18)
        dob = data.get('date_of_birth')
        if dob:
            age = (date.today() - dob).days // 365
            if age < 18:
                raise serializers.ValidationError({"date_of_birth": "You must be at least 18 years old."})

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user

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