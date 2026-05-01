import json
import logging
import uuid

from django.http import JsonResponse

logger = logging.getLogger('anime_api')

class GlobalExceptionLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        """
        Гарантоване перехоплення винятків (500 помилок).
        """
        # 1. Генерація УНІКАЛЬНОГО ідентифікатора помилки для відстеження в логах
        error_id = uuid.uuid4().hex[:8].upper()

        # 2. Збір КОНТЕКСТНОЇ інформації (параметри, стан системи)
        user = request.user.username if request.user.is_authenticated else 'Anonymous'
        
        # Конвертація параметрів запиту в словник для зручного логування
        query_params = dict(request.GET)
        
        context = {
            "error_id": error_id,
            "user": user,
            "method": request.method,
            "path": request.path,
            "query_params": query_params,
            "client_ip": request.META.get('REMOTE_ADDR')
        }

        # 3. Логування винятку разом із унікальним ID та повним контекстом
        logger.error(
            f"[Error ID: {error_id}] Необроблене виключення! \n"
            f"Контекст: {json.dumps(context, ensure_ascii=False)} \n"
            f"Деталі помилки: {str(exception)}", 
            exc_info=True
        )
        
        # 4. Формування ІНФОРМАТИВНОГО повідомлення для клієнта (React)
        return JsonResponse({
            "error": "Internal Server Error",
            "message": "Ой! Щось пішло не так на нашому боці. Ми вже зафіксували проблему.",
            "error_id": error_id,
            "support_action": f"Якщо проблема повторюється, зверніться до підтримки та вкажіть код помилки: {error_id}"
        }, status=500)