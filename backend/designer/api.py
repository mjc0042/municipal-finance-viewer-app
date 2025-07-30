from ninja import NinjaAPI

api = NinjaAPI(urls_namespace="design")

@api.get("/")
def get_design(request):
    return "Design Page"
