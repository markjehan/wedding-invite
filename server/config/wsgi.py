import os
import sys
from pathlib import Path

from django.core.wsgi import get_wsgi_application

# Vercel loads this file from the project root (see pyproject.toml), where `config` and `guests`
# are not importable until server/ is on the path.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
application = get_wsgi_application()
