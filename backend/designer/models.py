from django.db import models

from main.models import CustomUser as User

class GeneratedImage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_images')
    image_url = models.URLField()
    prompt = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_saved = models.BooleanField(default=False)
    theme = models.CharField(max_length=100)
    sections_data = models.JSONField()

    class Meta:
        ordering = ['-created_at']