# utils.py - Complete with all necessary imports
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

def send_verification_email(user, email=None):
    email_to_verify = email or user.email
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    
    verify_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/?email={email_to_verify}"

    send_mail(
        subject="Verify your email" if not email else "Verify your new email address",
        message=f"Hi {user.username},\n\nPlease verify your email:\n{verify_link}",
        from_email="noreply@yourapp.com",
        recipient_list=[email_to_verify],
    )

def send_password_change_confirmation(user):
    """
    Send confirmation email when password is changed
    """
    send_mail(
        subject="Password Changed Successfully",
        message=f"Hi {user.username},\n\nYour password has been changed successfully.\n\nIf you didn't make this change, please contact support immediately.",
        from_email="noreply@yourapp.com",
        recipient_list=[user.email],
    )


def send_email_change_verification(user, new_email):
    """Send email change verification to the new email address"""
    uid = urlsafe_base64_encode(force_bytes(user.id))
    token = default_token_generator.make_token(user)
    
    verification_link = f"{settings.FRONTEND_URL}/verify-email-change/{uid}/{token}/{urlsafe_base64_encode(force_bytes(new_email))}/"
    
    send_mail(
        subject="Verify Your New Email Address",
        message=f"""
        Hi {user.username},
        
        You have requested to change your email address to {new_email}.
        
        Please click the link below to verify your new email address:
        {verification_link}
        
        If you didn't request this change, please ignore this email.
        
        Thank you,
        Your App Team
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[new_email],
    )

def send_verification_email(user, email=None):
    """Send standard verification email"""
    email_to_verify = email or user.email
    uid = urlsafe_base64_encode(force_bytes(user.id))
    token = default_token_generator.make_token(user)

    # ✅ Use backend URL, not frontend
    verification_link = f"https://react-django-ecommerce-cy9p.onrender.com/verify-email/{uid}/{token}/"

    send_mail(
        subject="Verify Your Email Address",
        message=f"""
        Hi {user.username},

        Please verify your email address by clicking the link below:
        {verification_link}

        Thank you,
        Your App Team
        """,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email_to_verify],
    )

import stripe
from django.conf import settings

def create_stripe_customer(user):
    """Create a Stripe customer for a user"""
    try:
        customer = stripe.Customer.create(
            email=user.email,
            name=user.username,
            metadata={
                "user_id": user.id,
                "username": user.username
            }
        )
        return customer
    except stripe.error.StripeError as e:
        print(f"Error creating Stripe customer: {e}")
        return None

def create_payment_intent(amount, currency, customer_id=None, metadata=None):
    """Create a Stripe PaymentIntent"""
    try:
        intent_data = {
            'amount': int(amount * 100),  # Convert to cents
            'currency': currency,
            'payment_method_types': ['card'],
            'metadata': metadata or {}
        }
        
        if customer_id:
            intent_data['customer'] = customer_id
            
        intent = stripe.PaymentIntent.create(**intent_data)
        return intent
    except stripe.error.StripeError as e:
        print(f"Error creating PaymentIntent: {e}")
        return None