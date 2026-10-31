
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import ProcurementRequest, SupplierInvitation, Bid
from .serializers import (
    ProcurementRequestSerializer,
    SupplierInvitationSerializer,
    BidSerializer
)


# Procurement API
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def procurement_list(request):

    if request.method == "GET":
        procurements = ProcurementRequest.objects.all().order_by("-created_at")

        for procurement in procurements:
            procurement.update_auction_status()

        serializer = ProcurementRequestSerializer(procurements, many=True)
        return Response(serializer.data)

    serializer = ProcurementRequestSerializer(data=request.data)

    if serializer.is_valid():
        procurement = serializer.save()
        procurement.update_auction_status()

        return Response(
            ProcurementRequestSerializer(procurement).data,
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Supplier Invitation API
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def supplier_invitation_list(request):

    if request.method == "GET":
        invitations = SupplierInvitation.objects.all().order_by("-created_at")
        serializer = SupplierInvitationSerializer(invitations, many=True)
        return Response(serializer.data)

    data = request.data.copy()
    data["token_hash"] = ""

    serializer = SupplierInvitationSerializer(data=data)

    if serializer.is_valid():
        invitation = serializer.save()

        return Response({
            "message": "Supplier added successfully.",
            "invitation_id": invitation.id,
            "supplier_name": invitation.supplier_name,
            "supplier_email": invitation.supplier_email,
            "procurement": invitation.procurement_id,
            "invitation_link": f"/supplier/{invitation.id}"
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Public Supplier Invitation Details
@api_view(["GET"])
def supplier_invitation_detail(request, invitation_id):

    invitation = get_object_or_404(
        SupplierInvitation,
        id=invitation_id
    )

    procurement = invitation.procurement
    auction_status = procurement.update_auction_status()

    return Response({
        "invitation_id": invitation.id,
        "supplier_name": invitation.supplier_name,
        "supplier_email": invitation.supplier_email,
        "procurement_id": procurement.id,
        "procurement_title": procurement.title,
        "description": procurement.description,
        "quantity": procurement.quantity,
        "starting_price": procurement.starting_price,
        "is_active": procurement.is_active,
        "start_time": procurement.start_time,
        "end_time": procurement.end_time,
        "auction_status": auction_status
    }, status=status.HTTP_200_OK)


# Bid API
@api_view(["GET", "POST"])
def bid_list(request):

    if request.method == "GET":
        bids = Bid.objects.all().order_by("-created_at")
        serializer = BidSerializer(bids, many=True)
        return Response(serializer.data)

    data = request.data.copy()
    invitation_id = data.pop("invitation_id", None)

    if not invitation_id:
        return Response(
            {"error": "Invitation ID is required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    invitation = get_object_or_404(
        SupplierInvitation,
        id=invitation_id
    )

    procurement = invitation.procurement

    # Update auction status before accepting a bid
    auction_status = procurement.update_auction_status()

    if auction_status == ProcurementRequest.AuctionStatus.SCHEDULED:
        return Response(
            {"error": "Auction has not started yet."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if auction_status == ProcurementRequest.AuctionStatus.CLOSED:
        return Response(
            {"error": "Auction is closed. Bids are no longer accepted."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if str(data.get("procurement")) != str(invitation.procurement_id):
        return Response(
            {"error": "This invitation does not match the procurement."},
            status=status.HTTP_400_BAD_REQUEST
        )

    data["supplier"] = invitation.id

    serializer = BidSerializer(data=data)

    if serializer.is_valid():

        if serializer.validated_data["amount"] >= procurement.starting_price:
            return Response(
                {"error": "Bid amount must be lower than starting price."},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save()
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Lowest Bid API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def lowest_bid(request, procurement_id):

    procurement = get_object_or_404(
        ProcurementRequest,
        id=procurement_id
    )

    procurement.update_auction_status()

    bid = Bid.objects.filter(
        procurement_id=procurement_id
    ).order_by("amount", "created_at").first()

    if bid is None:
        return Response(
            {"message": "No bids found for this procurement."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = BidSerializer(bid)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Procurement Bid History API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def procurement_bid_history(request, procurement_id):

    procurement = get_object_or_404(
        ProcurementRequest,
        id=procurement_id
    )

    procurement.update_auction_status()

    bids = Bid.objects.filter(
        procurement_id=procurement_id
    ).order_by("amount", "created_at")

    if not bids.exists():
        return Response(
            {"message": "No bids found for this procurement."},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = BidSerializer(bids, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# Procurement Summary and Winner API
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def procurement_summary(request, procurement_id):

    procurement = get_object_or_404(
        ProcurementRequest,
        id=procurement_id
    )

    auction_status = procurement.update_auction_status()

    bids = Bid.objects.filter(
        procurement_id=procurement_id
    )

    total_bids = bids.count()
    lowest = bids.order_by("amount", "created_at").first()
    highest = bids.order_by("-amount", "created_at").first()

    winner = None

    if auction_status == ProcurementRequest.AuctionStatus.CLOSED and lowest:
        winner = {
            "supplier_name": lowest.supplier.supplier_name,
            "supplier_email": lowest.supplier.supplier_email,
            "winning_bid": lowest.amount
        }

    return Response({
        "procurement_id": procurement.id,
        "title": procurement.title,
        "starting_price": procurement.starting_price,
        "is_active": procurement.is_active,
        "auction_status": auction_status,
        "start_time": procurement.start_time,
        "end_time": procurement.end_time,
        "total_bids": total_bids,
        "lowest_bid": lowest.amount if lowest else None,
        "highest_bid": highest.amount if highest else None,
        "winner": winner
    }, status=status.HTTP_200_OK)
