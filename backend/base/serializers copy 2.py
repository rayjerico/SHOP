from django.contrib.auth.models import User, shippingsAddress, orderItem
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[
            UniqueValidator(
                queryset=User.objects.all(),
                message="A user with this email already exists.",
            )
        ],
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
        ]
        extra_kwargs = {
            "password": {
                "write_only": True,
            }
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        return user

class ShippingAddressSerializer(serializers.ModelSerializer):
        class Meta:
            model = shippingsAddress
            fields = "__all__"

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = orderItem
        fields = ['product', 'qty', 'price', 'line_total','id']
    
    def get_line_total(self, obj):
        return obj.qty * obj.price

class PaymentMethodSerializer(serializers.ModelSerializer):
   items = serializers.SerializerMethodField()
   shipping = serializers.SerializerMethodField()
   class Meta:
     model = paymentMethod
     fields = ['id', 'user', 'totalPrice', 'isPaid', 'paidAt', 'xendit_invoice_id', 'xendit_external_id', 'xendit_status','items','shipping']

    def get_items(self, obj):
        qs = obj.orderitem_set.select_related('product').all()
        return OrderItemSerializer(qs, many=True).data

    def get_shipping(self, obj):
        return ShippingAddressSerializer(obj.shipping_address).data
        if addr:
            return ShippingAddressSerializer(addr).data
        return None
