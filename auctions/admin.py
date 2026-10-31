from django.contrib import admin  # Django admin panel ko import karta hai
from .models import ProcurementRequest, SupplierInvitation, Bid  # Hamare models import karta hai


admin.site.register(ProcurementRequest)  # Procurement requests ko admin mein dikhata hai
admin.site.register(SupplierInvitation)  # Supplier invitations ko admin mein dikhata hai
admin.site.register(Bid)  # Bids ko admin mein dikhata hai
