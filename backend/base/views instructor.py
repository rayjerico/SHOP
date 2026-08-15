import uuid
from decimal import Decimal
from django.conf import settings
from django.db import transaction
import requests
from .models import paymentMethod, shippingsAddress
from .serializers import CheckoutSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_xendit_payment(request):
    serializer = CheckoutSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user = request.user
    data = serializer.validated_data

    if not user.email:
        return Response(
            {'error': 'Your Account needs an email address before checkout.'},
            status=status.HTTP_400_BAD_REQUEST,
        )


    cart_items = cartUser.objects.filter(user=user).selected_related('product')

    if not cart_items.exist():
        return Response(
            {'error': 'Cart is empty'},
            status=status.HTTP_400_BAD_REQUEST
        )

    total_price = sum(
        item.product.product_price * item.qty
        for item in cart_items
        )


    if not settings.XENDIT_SECRET_KEY:
        return Response(
            {'error': 'XENDIT_SECRET_KEY is not configured.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


    xendit_amount = float(Decimal(total_price).quantize(Decimal('0.01')))
    external_id = f'order-{user.id}-{uuid.uuid4().hex}'  

    payload = {
        'external_id': external_id,
        'amount': xendit_amount,
        'currency': 'PHP',
        'payer_email': user.email,
        'description': 'Order Payment',
        'success_redirect_url': settings.XENDIT_SUCCESS_REDIRECT_URL,
        'failure_redirect_url': settings.XENDIT_FAILURE_REDIRECT_URL,
        'customer': {
            'given_names': data['fullName'],
            'email': user.email
        },
        'customer_notification_preference': {
            'invoices_created': ['email'],
            'invoice_paid': ['email'],
            'invoice_expired': ['email'],
        }

    }


    try:
        xendit_response = requests.post(
            'https://api.xendit.co/v2/invoices',
            auth=(settings.XENDIT_SECRET_KEY, ''),
            json=payload,
            timeout=30,
        )
        xendit_response.raise_for_status()

        result = xendit_response.json()
    except requests.RequestException as exc:
        error_message = str(exc)
        if getattr(exc, 'response', None) is not None:
            try:
                error_message = exc.response.json()
            except ValueError:
                error_message = exc.response.text
        return Response(
            {'error': error_message},
            status=status.HTTP_400_BAD_REQUEST
        )

    if 'invoice_url' not in result or 'id' not in result:
        return Response({'error': result}, status=status.HTTP_400_BAD_REQUEST)

    checkout_url = result['invoice_url']
    xendit_invoice_id = result['id']
    xendit_status = result.get('status', 'PENDING')

    with transaction.atomic():
        payment = paymentMethod.objects.create (
            user=user,
            totalPrice=total_price,
            isPaid=False,
            xendit_invoice_id=xendit_invoice_id,
            xendit_external_id=external_id,
            xendit_status=xendit_status,
        )

        shippingsAddress.objects.create(
            paymentID=payment,
            fullName = data['fullName'],
            address = data['address'],
            city = data['city'],
            postalCode = data['postalCode'],
            country = data['country'],
        )
    return Response({'checkout_url': checkout_url}, status=status.HTTP_200_OK)