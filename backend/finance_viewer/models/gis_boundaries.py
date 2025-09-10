# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.contrib.gis.db import models

class MunicipalBoundaries(models.Model):
    id = models.BigIntegerField(primary_key=True, blank=True, null=False)
    municipal_name = models.TextField(blank=True, null=True)
    municipal_code = models.TextField(blank=True, null=True)
    municipal_type = models.TextField(blank=True, null=True)
    county_name = models.TextField(blank=True, null=True)
    state = models.TextField(blank=True, null=True)
    gnis_id = models.TextField(blank=True, null=True)
    fips_code = models.TextField(blank=True, null=True)
    fips_name = models.TextField(blank=True, null=True)
    pop_1990 = models.TextField(blank=True, null=True)
    pop_2000 = models.TextField(blank=True, null=True)
    pop_2010 = models.FloatField(blank=True, null=True)
    pop_2020 = models.FloatField(blank=True, null=True)
    sq_mi = models.FloatField(blank=True, null=True)
    geometry = models.GeometryField(srid=4269, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'municipal_boundaries'


class StateBoundaries(models.Model):
    id = models.BigIntegerField(primary_key=True, blank=True, null=False)
    statefp = models.TextField(blank=True, null=False)
    statens = models.TextField(blank=True, null=True)
    geoidfq = models.TextField(blank=True, null=True)
    geoid = models.TextField(blank=True, null=True)
    stusps = models.TextField(blank=True, null=True)
    name = models.TextField(blank=True, null=False)
    lsad = models.TextField(blank=True, null=True)
    aland = models.BigIntegerField(blank=True, null=True)
    awater = models.BigIntegerField(blank=True, null=True)
    geometry = models.GeometryField(srid=4269, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'state_boundaries'
