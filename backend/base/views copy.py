import json

@csrf_exempt
@api_view(['POST'])
def xendit_webhook(request):
    try: 
        callback_token = request.header.get('x-callback-token')

        if not settings.XENDIT_CALLBACK_TOKEN:
            return Response({'error': 'Invalid xendit callback token'}, status=status.HTTP_403_FORBIDDEN)
        if callback_token != settings.XENDIT_CALLBACK_TOKEN:
            return Response({'error': 'Invalid Xendit callback token.'}, status=status.HTTP_403_FORBIDDEN)

        payload = json.loads(request.body)

        xendit_invoice_id = payload.get('id')
        xendit_external_id = payload.get('external_id')
        xendit_status = payload.get('status')

        if not xendit_invoice_id and not xendit_external_id:
            return Response({'error': 'Missing Xendit Invoice reference'}, status=status.HTTP_400_BAD_REQUEST)

        payment = None
        if xendit_invoice_id:
            payment = paymentMethod.objects.filter(xendit_invoice_id=xendit_invoice_id,).first()
        if not payment and xendit_external_id:
            payment = paymentMethod.objects.filter(xendit_external_id=xendit_external_id,).first()
        if not payment:
            return Response({'message': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

        if xendit_status:
            payment.xendit_status = xendit_status
            payment.save(update_field=['xendit_status'])

        if xendit_status not in ['PAID', 'SETTLED']:
            return Response({'message': 'Xendit event received'}, status=status.HTTP_200_OK)

        if payment.isPaid:
            return Response(
                {'message': 'Already Processed'}, status=status.HTTP_200_OK
            )
        payment.mark_paid()

        return Response({'message': 'Payment confirmed, Order Items Created'}, status=status.HTTP_200_OK)
    except(KeyError, TypeError, ValueError, json.JSONDecodeError) as exc:
        return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)