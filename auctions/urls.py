from django.urls import path

from .views import (
    procurement_list,
    supplier_invitation_list,
    supplier_invitation_detail,
    bid_list,
    lowest_bid,
    procurement_bid_history,
    procurement_summary,
)

urlpatterns = [
    path("procurements/", procurement_list, name="procurement-list"),

    path("invitations/", supplier_invitation_list, name="supplier-invitation-list"),

    path(
        "invitations/<int:invitation_id>/",
        supplier_invitation_detail,
        name="supplier-invitation-detail"
    ),

    path("bids/", bid_list, name="bid-list"),

    path(
        "procurements/<int:procurement_id>/lowest-bid/",
        lowest_bid,
        name="lowest-bid"
    ),

    path(
        "procurements/<int:procurement_id>/bids/",
        procurement_bid_history,
        name="procurement-bid-history"
    ),

    path(
        "procurements/<int:procurement_id>/summary/",
        procurement_summary,
        name="procurement-summary"
    ),
]