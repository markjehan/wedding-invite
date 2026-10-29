"""Settings for the invitation's server: a personal link for every guest, their replies, and the
admin pages where the couple keep the guest list.

It runs as it is on the laptop. On the real server, INVITE_ENV=production turns debugging off and
DJANGO_SECRET_KEY and DJANGO_ALLOWED_HOSTS must come from the environment.

On Vercel (which sets VERCEL=1) it is always in production, and the guest list lives in the Postgres
database named by DATABASE_URL, which adding Neon to the project sets. Vercel keeps no file the app
writes, so the SQLite file would lose every reply there.
"""
import hashlib
import os
import secrets
from datetime import datetime, time
from pathlib import Path
from urllib.parse import parse_qsl, unquote, urlsplit
from zoneinfo import ZoneInfo

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent
# The invitation itself (index.html and everything it links to). Only those files are ever served;
# see guests/site.py.
SITE_DIR = Path(os.environ.get('INVITE_SITE_DIR') or BASE_DIR.parent)
# The guest list. It holds names and phone numbers, so it never goes into git or into an image.
DATA_DIR = Path(os.environ.get('INVITE_DATA_DIR') or BASE_DIR / 'data')
ON_VERCEL = bool(os.environ.get('VERCEL'))
if not ON_VERCEL:  # Vercel's disk is read-only
    DATA_DIR.mkdir(exist_ok=True)

PRODUCTION = os.environ.get('INVITE_ENV') == 'production' or ON_VERCEL
DEBUG = not PRODUCTION
if PRODUCTION:
    if os.environ.get('DJANGO_SECRET_KEY'):
        SECRET_KEY = os.environ['DJANGO_SECRET_KEY']
    elif ON_VERCEL and os.environ.get('DATABASE_URL'):
        # One less thing to set up on Vercel: the database address carries Neon's long random
        # password, which only this project knows, so the key is drawn from it. A new database
        # password signs everyone out once, and nothing else.
        SECRET_KEY = hashlib.sha256(b'wedding-invite secret key:' + os.environ['DATABASE_URL'].encode()).hexdigest()
    elif ON_VERCEL:
        raise ImproperlyConfigured('No DATABASE_URL: add the Neon database to the Vercel project (Storage tab).')
    else:
        raise ImproperlyConfigured('Set DJANGO_SECRET_KEY.')
    ALLOWED_HOSTS = [host for host in os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(',') if host]
    # Vercel names each deployment itself: its own address, its branch's, and the project's main one
    # (your domain, once it is added).
    ALLOWED_HOSTS += [os.environ[name] for name in ('VERCEL_URL', 'VERCEL_BRANCH_URL', 'VERCEL_PROJECT_PRODUCTION_URL')
                      if os.environ.get(name)]
    if not ALLOWED_HOSTS:
        raise ImproperlyConfigured('Set DJANGO_ALLOWED_HOSTS to the address the site is served at.')
else:
    key_file = DATA_DIR / 'dev-secret-key'
    if not key_file.exists():
        key_file.write_text(secrets.token_urlsafe(50))
    SECRET_KEY = key_file.read_text()
    # The laptop, and a phone on the same Wi-Fi when the server is started on 0.0.0.0.
    ALLOWED_HOSTS = ['*']

# The address guests' links start with, as written into WhatsApp messages and the Excel download,
# e.g. https://naveenanddulanjani.com. Unset, it is whatever address the admin pages were opened at.
SITE_URL = os.environ.get('INVITE_SITE_URL', '').rstrip('/')

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'allauth',
    'allauth.account',
    'allauth.mfa',
    'guests',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'guests.middleware.RequireTwoStep',
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'
# A guest's link is /k7m2p9qa with no slash after it; nothing should redirect it to one.
APPEND_SLASH = False

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [BASE_DIR / 'templates'],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

if os.environ.get('DATABASE_URL'):
    # postgresql://user:password@host/name?sslmode=require, as Neon gives it. Every request opens and
    # closes its own connection: Vercel's instances come and go, and Neon's pooler shares them out.
    _db = urlsplit(os.environ['DATABASE_URL'])
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': _db.path.lstrip('/'),
            'USER': unquote(_db.username or ''),
            'PASSWORD': unquote(_db.password or ''),
            'HOST': _db.hostname,
            'PORT': _db.port or '',
            'OPTIONS': dict(parse_qsl(_db.query)),
            'CONN_MAX_AGE': 0,
            'DISABLE_SERVER_SIDE_CURSORS': True,
        }
    }
elif ON_VERCEL:
    raise ImproperlyConfigured('No DATABASE_URL: add the Neon database to the Vercel project (Storage tab).')
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': DATA_DIR / 'invite.sqlite3',
        }
    }
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
# The couple's pages' own stylesheet and script. Django stops serving these once debugging is off,
# which left the login and the guest list as bare text in production while looking fine on the
# laptop. WhiteNoise serves them in both modes, straight from the app, so there is no build step to
# forget on the server.
WHITENOISE_USE_FINDERS = True

LANGUAGE_CODE = 'en'
TIME_ZONE = 'Asia/Colombo'
USE_TZ = True

# A guest's code is in the address of their page, so the page never tells another site where a
# visitor came from (the map and calendar links leave from it).
SECURE_REFERRER_POLICY = 'same-origin'

# ---------- Signing in to the couple's pages (/admin/, guests/dashboard.py) ----------
# Accounts are made on the server with `manage.py createsuperuser`; nobody can sign up. Every account
# has to add an authenticator app before it reaches the guest list (guests/middleware.py), and from
# then on signing in takes the password and the app's 6-digit code, or a one-time backup code.
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]
LOGIN_URL = 'account_login'
LOGIN_REDIRECT_URL = '/admin/'
ACCOUNT_LOGOUT_REDIRECT_URL = '/accounts/login/'
ACCOUNT_ADAPTER = 'guests.accounts.ClosedAccountAdapter'
ACCOUNT_LOGIN_METHODS = {'username'}
ACCOUNT_SIGNUP_FIELDS = ['username*', 'password1*', 'password2*']
ACCOUNT_EMAIL_VERIFICATION = 'none'
ACCOUNT_SESSION_REMEMBER = False
MFA_SUPPORTED_TYPES = ['totp', 'recovery_codes']
MFA_TOTP_ISSUER = 'Naveen & Dulanjani guests'
# Accept the code from the 30 seconds either side as well, so a code typed as it changes, or a phone
# whose clock is a little out, still works. Each code still works only once.
MFA_TOTP_TOLERANCE = 1
# A signed-in admin is signed out after a day, or when the browser is closed.
SESSION_COOKIE_AGE = 60 * 60 * 24
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

if PRODUCTION:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = CSRF_COOKIE_SECURE = True
    CSRF_TRUSTED_ORIGINS = [f'https://{host}' for host in ALLOWED_HOSTS]

# The last day a guest can send or change a reply, as YYYY-MM-DD, Sri Lanka time. Unset, replies
# stay open.
_deadline = os.environ.get('INVITE_RSVP_DEADLINE')
RSVP_CLOSES = (datetime.combine(datetime.strptime(_deadline, '%Y-%m-%d').date(), time.max, ZoneInfo(TIME_ZONE))
               if _deadline else None)
