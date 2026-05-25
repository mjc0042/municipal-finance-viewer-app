from django.db import models

class UserFinanceUpdatesLog(models.Model):
    update_id = models.BigAutoField(primary_key=True)
    user_id = models.CharField(max_length=255)
    mid = models.UUIDField()
    year = models.IntegerField()
    field_name = models.CharField(max_length=200)
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    modification_time = models.DateTimeField()

    class Meta:
        managed = True
        db_table = 'user_finances_updates_log'

