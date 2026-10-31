
from rest_framework import serializers
from decimal import Decimal

from .models import ProcurementRequest, SupplierInvitation, Bid


# Procurement Request Serializer
class ProcurementRequestSerializer(serializers.ModelSerializer):

    quantity = serializers.IntegerField(
        min_value=1
    )

    starting_price = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01")
    )

    class Meta:
        model = ProcurementRequest
        fields = "__all__"


# Supplier Invitation Serializer
class SupplierInvitationSerializer(serializers.ModelSerializer):

    token_hash = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = SupplierInvitation
        fields = [
            "id",
            "procurement",
            "supplier_name",
            "supplier_email",
            "token_hash",
            "created_at"
        ]


# Bid Serializer
class BidSerializer(serializers.ModelSerializer):

    amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        min_value=Decimal("0.01")
    )

    procurement_title = serializers.CharField(
        source="procurement.title",
        read_only=True
    )

    supplier_name = serializers.CharField(
        source="supplier.supplier_name",
        read_only=True
    )

    supplier_email = serializers.EmailField(
        source="supplier.supplier_email",
        read_only=True
    )

    class Meta:
        model = Bid

        fields = [
            "id",
            "procurement",
            "procurement_title",
            "supplier",
            "supplier_name",
            "supplier_email",
            "amount",
            "created_at"
        ]

        read_only_fields = [
            "id",
            "created_at"
        ]
