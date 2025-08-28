# models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

# ✅ User model
class User(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.username

# ✅ Category model
class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to="category/", blank=True, null=True)

    def __str__(self):
        return self.name

# ✅ Product model
class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    image = models.ImageField(upload_to="products/", blank=True, null=True)

    def __str__(self):
        return self.name

# ✅ Cart model
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')  # one product per user cart

    def __str__(self):
        return f"{self.user.username} - {self.product.name}"

# ✅ Order model
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    products = models.ManyToManyField(Product, through='OrderItem')
    total_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} by {self.user.username}"

# ✅ OrderItem (through table for Order-Product)
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # price at order time

    def __str__(self):
        return f"{self.product.name} ({self.quantity})"

# ✅ Payment model
class Payment(models.Model):
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="payment")
    payment_method = models.CharField(max_length=50)  # e.g., card, UPI, COD
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment for Order #{self.order.id} - {self.status}"




class Review(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="reviews")
    product = models.ForeignKey(Product,on_delete=models.CASCADE,related_name="reviews")
    rating = models.PositiveSmallIntegerField(default=0)
    comment = models.TextField(blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "product")  
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.product.name} ({self.rating})"