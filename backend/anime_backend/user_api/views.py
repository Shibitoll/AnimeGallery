
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CustomUser
from .serializers import RegisterSerializer


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # Використовуємо напряму CustomUser
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        
        months_ua = {
            1: "січня", 2: "лютого", 3: "березня", 4: "квітня",
            5: "травня", 6: "червня", 7: "липня", 8: "серпня",
            9: "вересня", 10: "жовтня", 11: "листопада", 12: "грудня"
        }
        
        month = months_ua.get(user.date_joined.month, "") if user.date_joined else ""
        year = user.date_joined.year if user.date_joined else ""
        joined_str = f"{month} {year}" if month and year else "Невідомо"

        return Response({
            "username": user.username,
            "email": user.email,
            "joinedDate": joined_str
        })
    
    def patch(self, request):
        user = request.user
        data = request.data
        
        # Перевіряємо, чи передали нове ім'я
        if 'username' in data:
            new_username = data['username']
            # Перевірка, чи не зайнято нове ім'я кимось іншим
            from .models import CustomUser  # Або як називається твоя модель
            if CustomUser.objects.exclude(pk=user.pk).filter(username=new_username).exists():
                return Response({'error': 'Це ім\'я вже зайняте'}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username
            
        # Перевіряємо, чи передали нову пошту
        if 'email' in data:
            new_email = data['email']
            if CustomUser.objects.exclude(pk=user.pk).filter(email=new_email).exists():
                return Response({'error': 'Ця пошта вже використовується'}, status=status.HTTP_400_BAD_REQUEST)
            user.email = new_email
            
        user.save()
        
        return Response({
            "message": "Профіль успішно оновлено",
            "username": user.username,
            "email": user.email
        }, status=status.HTTP_200_OK)