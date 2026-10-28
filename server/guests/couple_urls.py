"""The couple's pages, under /admin/ (see guests/dashboard.py)."""
from django.urls import path

from . import dashboard

app_name = 'couple'
urlpatterns = [
    path('', dashboard.overview, name='overview'),
    path('guests/', dashboard.guest_list, name='guests'),
    path('guests/new/', dashboard.guest_new, name='guest_new'),
    path('guests/<int:pk>/', dashboard.guest_page, name='guest'),
    path('guests/<int:pk>/remove/', dashboard.guest_delete, name='guest_delete'),
    path('guests/<int:pk>/whatsapp/', dashboard.send, name='send'),
    path('guests/<int:pk>/fix/', dashboard.guest_fix, name='guest_fix'),
    path('help/', dashboard.help_page, name='help'),
    path('add-from-excel/', dashboard.import_sheet, name='import'),
    path('add-from-excel/guest-list.xlsx', dashboard.blank_sheet, name='blank'),
    path('guests.xlsx', dashboard.export_sheet, name='export'),
]
