
from django.db import models
from django.utils import timezone


class ProcurementRequest(models.Model):

    class AuctionStatus(models.TextChoices):
        SCHEDULED = "scheduled", "Scheduled"
        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"

    title = models.CharField(max_length=200)

    description = models.TextField()

    quantity = models.PositiveIntegerField()

    starting_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    # Auction schedule
    start_time = models.DateTimeField(
        null=True,
        blank=True
    )

    end_time = models.DateTimeField(
        null=True,
        blank=True
    )

    # Auction status
    auction_status = models.CharField(
        max_length=20,
        choices=AuctionStatus.choices,
        default=AuctionStatus.ACTIVE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_active = models.BooleanField(
        default=True
    )

    def update_auction_status(self):
        """
        Automatically determine auction status using start and end time.
        """

        now = timezone.now()

        if not self.is_active:
            self.auction_status = self.AuctionStatus.CLOSED

        elif self.end_time and now >= self.end_time:
            self.auction_status = self.AuctionStatus.CLOSED
            self.is_active = False

        elif self.start_time and now < self.start_time:
            self.auction_status = self.AuctionStatus.SCHEDULED

        else:
            self.auction_status = self.AuctionStatus.ACTIVE

        self.save(
            update_fields=["auction_status", "is_active"]
        )

        return self.auction_status

    def __str__(self):
        return self.title


class SupplierInvitation(models.Model):

    procurement = models.ForeignKey(
        ProcurementRequest,
        on_delete=models.CASCADE,
        related_name="invitations"
    )

    supplier_name = models.CharField(
        max_length=150
    )

    supplier_email = models.EmailField()

    token_hash = models.CharField(
        max_length=64
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.supplier_name


class Bid(models.Model):

    procurement = models.ForeignKey(
        ProcurementRequest,
        on_delete=models.CASCADE,
        related_name="bids"
    )

    supplier = models.ForeignKey(
        SupplierInvitation,
        on_delete=models.CASCADE,
        related_name="bids"
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.supplier.supplier_name} - {self.amount}"
