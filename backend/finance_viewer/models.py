from django.db import models

from django.contrib.gis.db import models as mdls  # use GeoDjango for geometry support

class StateBoundary(models.Model):
    id = mdls.IntegerField(primary_key=True)
    statefp = mdls.TextField(null=True)
    statens = mdls.TextField(null=True)
    geoidfq = mdls.TextField(null=True)
    geoid = mdls.TextField(null=True)
    stusps = mdls.TextField(null=True)
    name = mdls.TextField(null=True)
    lsad = mdls.TextField(null=True)
    aland = mdls.BigIntegerField(null=True)
    awater = mdls.BigIntegerField(null=True)
    geometry = mdls.GeometryField(srid=4269)

    class Meta:
        db_table = "state_boundaries"
        managed = False  # since table already exists

class MunicipalBoundary(models.Model):
    id = mdls.IntegerField(primary_key=True)
    municipal_name = mdls.CharField(max_length=200)
    municipal_code = mdls.CharField(max_length=50, blank=True)
    municipal_type = mdls.CharField(max_length=50, blank=True)
    county_name = mdls.CharField(max_length=100)
    state = mdls.CharField(max_length=2)
    gnis_id = mdls.CharField(max_length=20, blank=True)
    fips_code = mdls.CharField(max_length=20, blank=True)
    fips_name = mdls.CharField(max_length=100, blank=True)
    pop_1990 = mdls.IntegerField(null=True)
    pop_2000 = mdls.IntegerField(null=True)
    pop_2010 = mdls.IntegerField(null=True)
    pop_2020 = mdls.IntegerField(null=True)
    sq_mi = mdls.FloatField(null=True)
    geometry = mdls.GeometryField(srid=4269)

    class Meta:
        db_table = "municipal_boundaries"
        managed = False  # table already exists in database
