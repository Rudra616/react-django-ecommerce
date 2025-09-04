from django.conf import settings
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator

def send_verification_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    verify_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"

    send_mail(
        subject="Verify your email",
        message=f"Hi {user.username}, please verify your email:\n{verify_link}",
        from_email="noreply@yourapp.com",
        recipient_list=[user.email],
    )
