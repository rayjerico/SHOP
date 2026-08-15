from django.urls import path


from .views import (
    product_list,
    get_product_data,
    register_user,
    cart_view,
    add_to_cart,
    update_cart,
    delete_cart,
    get_user_profile,
    create_xendit_payment,
    xendit_webhook,
    list_user_orders,
)

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path(
        'products/',
        product_list,
        name='product_list'
    ),

    path(
        'products/<int:pk>/',
        get_product_data,
        name='product_data'
    ),

    path(
        'register/',
        register_user,
        name='register'
    ),

    path(
        'token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    path(
        'cart/',
        cart_view,
        name='cart'
    ),

    path(
        'cart/add/',
        add_to_cart,
        name='add_to_cart'
    ),

    path(
        'cart/<int:pk>/',
        update_cart,
        name='update_cart'
    ),

    path(
        'cart/<int:pk>/delete/',
        delete_cart,
        name='delete_cart'
    ),
   
   path(
    'user/', 
    get_user_profile, 
    name='user_profile'),

path(
    'checkout/xendit', 
    create_xendit_payment, 
    name='create_xendit_payment'),

path(
    'webhook/xendit', 
    xendit_webhook, 
    name='xendit_webhook'),

path(
    'orders/', 
    list_user_orders, 
    name='list_user_orders'),

]
