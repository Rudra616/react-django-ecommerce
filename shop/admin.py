from django.contrib import admin
from .models import User, Category, Product, Cart, Order, OrderItem, Payment

# Inline for OrderItem
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1  # Number of extra forms to display

# Order Admin
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'status', 'created_at', 'updated_at')
    list_editable = ('status',)  # ✅ Makes status editable in the list view
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'id')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [OrderItemInline]

# Optional: register other models
admin.site.register(User)
# admin.site.register(Category)
# admin.site.register(Product)
# admin.site.register(Cart)
admin.site.register(Payment)
