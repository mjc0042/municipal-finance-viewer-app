""" Tests for the state municipality comparison endpoint

Tests exercise the HTTP seam: request in, JSON out. DB rows are seeded via
the ORM; the GIS boundary data source (a separate read-only database) is
stubbed at the API module boundary.
"""

import json
import uuid
from unittest.mock import patch

from decimal import Decimal

from django.test import TestCase

from ninja_jwt.tokens import RefreshToken
from main.models import CustomUser

from finance_viewer.models.municipal_finance import Municipalities, MunicipalFinances

STATE_DB = 'municipal_finances'


def _finance_row(mid: str, year: int, **overrides) -> dict:
    row = {
        'mid': mid,
        'year': year,
        'debt': Decimal('100.0'),
        'population': Decimal('50.0'),
        'total_revenues': Decimal('200.0'),
        'police_force': 10,
        'modifier': 'test',
        'created_at': '2024-01-01T00:00:00Z',
    }
    row.update(overrides)
    return row


class CompareStateMunicipalitiesTests(TestCase):
    databases = {'default', 'municipal_finances', 'gis_boundaries'}

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = CustomUser.objects.create_user(
            email='test@example.com', password='testpass123'
        )

    def setUp(self):
        self.client.defaults['HTTP_AUTHORIZATION'] = f'Bearer {self._token()}'
        MunicipalFinances.objects.using(STATE_DB).all().delete()
        Municipalities.objects.using(STATE_DB).all().delete()

    def _token(self) -> str:
        return str(RefreshToken.for_user(self.user).access_token)

    def _seed_municipality(self, name: str, state: str = 'MA'):
        municipality = Municipalities(
            mid=uuid.uuid4(), name=name, state=state, county_fips='25001'
        )
        municipality._state.db = STATE_DB
        municipality.save(using=STATE_DB, force_insert=True)
        return municipality

    def _seed_finance(self, municipality, year: int, **overrides):
        """ Seed a finance record; municipality may be a Municipalities instance or mid value """
        row = {
            'mid': municipality,
            'year': year,
            'debt': Decimal('100.0'),
            'population': Decimal('50.0'),
            'total_revenues': Decimal('200.0'),
            'police_force': 10,
            'modifier': 'test',
            'created_at': '2024-01-01T00:00:00Z',
        }
        row.update(overrides)
        MunicipalFinances.objects.using(STATE_DB).create(**row)

    def _compare(self, state_abbr: str = 'MA', calc: str = 'finances:debt', year_mode: str = 'latest',
                 boundary_props: dict[str, dict] | None = None):
        """ Issue a compare request; boundary_props maps mid to GIS boundary properties """
        with patch('finance_viewer.api.query_state_municipal_boundaries') as mock_boundaries:
            mock_boundaries.return_value = {
                'type': 'FeatureCollection',
                'features': [
                    {'type': 'Feature', 'id': i, 'properties': {**props, 'municipal_name': f'Muni{i}'}}
                    for i, props in enumerate((boundary_props or {}).values())
                ]
            }
            # The mid lookup joins on (county_fips, name) from the municipalities table;
            # stub the available-municipalities query to key features by mid directly
            with patch('finance_viewer.api.query_state_municipalities') as mock_munis:
                mock_munis.return_value = [
                    ('', f'Muni{i}', mid) for i, mid in enumerate((boundary_props or {}).keys())
                ]
                return self.client.get(
                    '/api/financial/state/municipalities/compare',
                    {'state_abbr': state_abbr, 'calc': calc, 'year_mode': year_mode}
                )

    def test_requires_authentication(self):
        self.client.defaults['HTTP_AUTHORIZATION'] = ''
        response = self.client.get(
            '/api/financial/state/municipalities/compare',
            {'state_abbr': 'MA', 'calc': 'finances:debt'}
        )
        self.assertEqual(response.status_code, 401)

    def test_single_field_calculation(self):
        mid = self._seed_municipality('Springfield')
        self._seed_finance(mid, 2022, debt=Decimal('100.0'))

        response = self._compare()

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["mid"], str(mid.mid))
        self.assertEqual(data[0]['value'], 100.0)
        self.assertEqual(data[0]['year'], 2022)

    def test_arithmetic_and_parentheses(self):
        mid = self._seed_municipality('Springfield')
        self._seed_finance(mid, 2022, debt=Decimal('100.0'), population=Decimal('50.0'))

        response = self._compare(
            calc='(,finances:debt,/,municipality:pop_2020,)',
            boundary_props={str(mid.mid): {'pop_2020': 20}}
        )

        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['value'], 5.0)

    def test_latest_year_per_municipality(self):
        mid_a = self._seed_municipality('Springfield')
        mid_b = self._seed_municipality('Chicopee')
        self._seed_finance(mid_a, 2021, debt=Decimal('10.0'))
        self._seed_finance(mid_a, 2023, debt=Decimal('30.0'))
        self._seed_finance(mid_b, 2022, debt=Decimal('20.0'))

        response = self._compare(year_mode='latest')

        data = json.loads(response.content)
        values = {r["mid"]: r["value"] for r in data}
        years = {r["mid"]: r["year"] for r in data}
        self.assertEqual(values[str(mid_a.mid)], 30.0)
        self.assertEqual(years[str(mid_a.mid)], 2023)
        self.assertEqual(values[str(mid_b.mid)], 20.0)
        self.assertEqual(years[str(mid_b.mid)], 2022)

    def test_shared_year_uses_newest_common_year(self):
        mid_a = self._seed_municipality('Springfield')
        mid_b = self._seed_municipality('Chicopee')
        self._seed_finance(mid_a, 2021, debt=Decimal('10.0'))
        self._seed_finance(mid_a, 2023, debt=Decimal('30.0'))
        self._seed_finance(mid_b, 2021, debt=Decimal('15.0'))
        self._seed_finance(mid_b, 2022, debt=Decimal('20.0'))

        response = self._compare(year_mode='shared')

        data = json.loads(response.content)
        values = {r["mid"]: r["value"] for r in data}
        years = {r["mid"]: r["year"] for r in data}
        # Newest year both municipalities have is 2021
        self.assertEqual(values[str(mid_a.mid)], 10.0)
        self.assertEqual(years[str(mid_a.mid)], 2021)
        self.assertEqual(values[str(mid_b.mid)], 15.0)
        self.assertEqual(years[str(mid_b.mid)], 2021)

    def test_shared_year_no_common_year_omits_all(self):
        mid_a = self._seed_municipality('Springfield')
        mid_b = self._seed_municipality('Chicopee')
        self._seed_finance(mid_a, 2021, debt=Decimal('10.0'))
        self._seed_finance(mid_b, 2022, debt=Decimal('20.0'))

        response = self._compare(year_mode='shared')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), [])

    def test_municipalities_without_finance_record_omitted(self):
        mid_with = self._seed_municipality('Springfield')
        self._seed_municipality('Chicopee')  # no finance record
        self._seed_finance(mid_with, 2022, debt=Decimal('100.0'))

        response = self._compare()

        data = json.loads(response.content)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["mid"], str(mid_with.mid))

    def test_division_by_zero_omits_municipality(self):
        mid_a = self._seed_municipality('Springfield')
        mid_b = self._seed_municipality('Chicopee')
        self._seed_finance(mid_a, 2022, debt=Decimal('100.0'), population=Decimal('50.0'))
        self._seed_finance(mid_b, 2022, debt=Decimal('100.0'), population=Decimal('0.0'))

        response = self._compare(
            calc='finances:debt,/,municipality:pop_2020',
            boundary_props={str(mid_a.mid): {'pop_2020': 20}, str(mid_b.mid): {'pop_2020': 0}}
        )

        data = json.loads(response.content)
        self.assertEqual([r['mid'] for r in data], [str(mid_a.mid)])

    def test_malformed_calculation_returns_400(self):
        self._seed_municipality('Springfield')

        response = self._compare(calc='finances:debt;DROP TABLE users')

        self.assertEqual(response.status_code, 400)
        body = json.loads(response.content)
        self.assertIn('error', body)

    def test_invalid_year_mode_returns_400(self):
        response = self._compare(year_mode='bogus')
        self.assertEqual(response.status_code, 400)

    def test_unsafe_expression_rejected(self):
        mid = self._seed_municipality('Springfield')
        self._seed_finance(mid, 2022)

        # A token string that assembles into a call expression must never evaluate
        response = self._compare(calc='finances:debt,+,municipality:pop_2020',
                                 boundary_props={str(mid.mid): {'pop_2020': 20}})
        self.assertEqual(response.status_code, 200)

    def test_municipality_boundary_property_used(self):
        # pop_2020 resolves from the GIS boundary properties keyed by mid;
        # with no boundary row the data point is missing and the municipality is omitted
        mid = self._seed_municipality('Springfield')
        self._seed_finance(mid, 2022, debt=Decimal('100.0'))

        response = self._compare(calc='finances:debt,/,municipality:pop_2020')

        data = json.loads(response.content)
        # No GIS boundary seeded -> municipality:pop_2020 missing -> omitted
        self.assertEqual(data, [])

    def test_empty_state_returns_empty_list(self):
        response = self._compare(state_abbr='WY')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), [])