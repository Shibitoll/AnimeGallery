import logging

from django.http import JsonResponse

logger = logging.getLogger('anime_api')

class GlobalExceptionLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        logger.error(
            f"Необроблене виключення (500) на шляху {request.path}: {str(exception)}", 
            exc_info=True
        )
        return JsonResponse({
            "error": "Internal Server Error",
            "message": "Виникла помилка на сервері. Розробники вже отримали лог."
        }, status=500)