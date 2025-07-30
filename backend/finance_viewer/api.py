from ninja import NinjaAPI

api = NinjaAPI(urls_namespace="financial")

@api.get("/municipality/finances")
def municpality_finances(request, name:str, state:str):
    return "Town Name"
