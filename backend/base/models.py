from django.db import models
from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

# Create your models here.
class Product(models.Model):
    product_name = models.CharField(max_length=255)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    brand = models.CharField(max_length=255)
    description = models.TextField()
    countInStock = models.IntegerField()
    image = models.ImageField(upload_to='products_images/')
    createdAt = models.DateField(auto_now_add=True)

def __str__(self):
    return self.product_name

class cartUser(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    qty = models.IntegerField()

class paymentMethod(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    totalPrice = models.DecimalField(max_digits=10, decimal_places=2)
    isPaid = models.BooleanField(default=False)
    paidAt = models.DateTimeField(null=True, blank=True)
    xendit_invoice_id = models.CharField(max_length=255, blank=True, default='')
    xendit_external_id = models.CharField(max_length=255, blank=True, default='', db_index=True)
    xendit_status = models.CharField(max_length=50, blank=True, default='PENDING')

    def mark_paid(self):
        if self.isPaid:
            return

        carts= cartUser.objects.filter(user=self.user)
        with transaction.atomic():
            for cart in carts:
                order_item = orderItem.objects.create(
                    product=cart.product,
                    payment=self,
                    qty=cart.qty,
                    price=cart.product.product_price * cart.qty
                )
                cart.delete()
            self.isPaid = True
            self.paidAt = timezone.now()
            self.save()

class orderItem(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    payment = models.ForeignKey(paymentMethod, on_delete=models.CASCADE)
    qty = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

class shippingsAddress(models.Model):
    paymentId = models.ForeignKey(paymentMethod, on_delete=models.CASCADE)
    fullName = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    postalCode = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    