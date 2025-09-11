# test_stripe.py
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import stripe
from django.conf import settings

print("Testing Stripe configuration...")
print(f"Stripe Secret Key: {'Configured' if settings.STRIPE_SECRET_KEY else 'Missing'}")
print(f"Stripe Publishable Key: {'Configured' if settings.STRIPE_PUBLISHABLE_KEY else 'Missing'}")

if settings.STRIPE_SECRET_KEY:
    try:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        # Test Stripe connection
        balance = stripe.Balance.retrieve()
        print("✅ Stripe connection successful!")
        print(f"Available balance: {balance.available[0].amount} {balance.available[0].currency}")
    except Exception as e:
        print(f"❌ Stripe connection failed: {e}")