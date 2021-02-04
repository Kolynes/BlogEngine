from django.http import JsonResponse

def json_response(status, data=None, error=None):
    return JsonResponse({
        "status": status,
        "data": data,
        "error": error
    })