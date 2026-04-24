"""
Utility functions for accounts app
"""
import secrets
import string
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def generate_temporary_password(length=12):
    """Generate a secure temporary password"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password


def send_agent_welcome_email(user, temporary_password):
    """
    Send welcome email to agent with temporary password
    """
    subject = 'Welcome to MiiZA Realtors - Agent Account Created'
    
    # Determine login URL based on environment
    # Check if we're in production by looking at DEBUG and ALLOWED_HOSTS
    is_production = not settings.DEBUG or any(
        'railway.app' in host or 'miizarealtors.com' in host 
        for host in settings.ALLOWED_HOSTS
    )
    
    if is_production:
        login_url = 'https://miizarealtors.com/admin/login'
    else:
        login_url = 'http://localhost:8080/admin/login'
    
    # Create email message
    message = f"""
Hello {user.get_full_name() or user.username},

Your agent account has been created successfully!

Your login credentials:
Username: {user.username}
Temporary Password: {temporary_password}

IMPORTANT: You must change your password on your first login.

Please log in at: {login_url}

After logging in with your temporary password, you will be prompted to change it.

Best regards,
MiiZA Realtors Team
"""
    
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False

