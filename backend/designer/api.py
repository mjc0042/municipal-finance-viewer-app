import json

from django.core.exceptions import ObjectDoesNotExist
from django.http import JsonResponse
from ninja import Router
from ninja_jwt.authentication import JWTAuth
from typing import Any, Dict


from .lib.cross_section_prompt_builder import build_prompt
from .models import GeneratedImage

router = Router()

@router.get("/")
def get_design(request):
    return "Design Page"


@router.get("/templates")
def get_design_templates(request) -> Dict[str, Any]:
    """Get available design templates"""
    return {
        "templates": [
            {"id": 1, "name": "Urban Core"},
            {"id": 2, "name": "Suburban Development"}
        ]
    }

@router.get("/cross-section/generate", auth=JWTAuth())
def generate_cross_section(request, units:str, theme:str, sections:str):
    """ Generate cross section image """

    try:
        sections_data = json.loads(sections)  # Use loads for string parsing

        # Compile prompt
        prompt = build_prompt(units, sections_data, theme)
        print(prompt)

        # Generate and fetch image from LLM
        image_url = call_llm_api(prompt)

        # TODO: (Future) Generate bird's eye render

        # Store the generate image
        generated_image = GeneratedImage.objects.create(
            user=request.user,
            image_url=image_url,
            #prompt=prompt,
            theme=theme,
            sections_data=sections_data
        )

        # TODO: Update user credits

        # Clean up old unsaved images (keeping 10 most recent)
        old_images=GeneratedImage.objects.filter(
            user=request.user,
            is_saved=False
        ).order_by('-create_ad')[10:]
        old_images.delete()

        return JsonResponse({
            "image:": {
                "id": generated_image.id,
                "imageUrl": image_url,
                "createdAt": generated_image.created_at,
                "isSaved": generated_image.is_saved
            }
        }, status=200)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@router.post("/cross-section/{image_id}/save", auth=JWTAuth())
def save_image(request, image_id: int):
    try:
        image = GeneratedImage.objects.get(id=image_id, user=request.user)
        image.is_saved = True
        image.save()
        return JsonResponse({"success": True})
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Image not found"}, status=404)
