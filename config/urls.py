"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from rest_framework.authtoken.views import obtain_auth_token
from django.contrib import admin #django admin panel
from django.urls import path,include # URL routing aur app URLs include karne ke liye

urlpatterns = [
    path("admin/", admin.site.urls),  # Admin panel ka route
    path("api/token/", obtain_auth_token, name="api_token"),
    path("api/", include("auctions.urls")),  # Auctions app ke URLs connect karta hai
]
