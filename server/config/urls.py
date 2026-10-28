from django.urls import include, path, re_path
from django.views.generic import RedirectView

from guests import views
from guests.codes import PATTERN

urlpatterns = [
    path('admin', RedirectView.as_view(url='/admin/')),
    path('admin/', include('guests.couple_urls')),
    path('accounts/', include('allauth.urls')),
    path('', views.general),
    re_path(rf'^(?P<code>{PATTERN})$', views.personal),
    re_path(rf'^(?P<code>{PATTERN})/reply$', views.reply),
    re_path(rf'^(?P<code>{PATTERN})/opened$', views.opened),
    re_path(r'^(?P<name>.+)$', views.site_file),
]
