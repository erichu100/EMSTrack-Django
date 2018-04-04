from rest_framework.parsers import JSONParser

from ambulance.models import Call, Patient, AmbulanceCallTime
from ambulance.serializers import CallSerializer, AmbulanceCallTimeSerializer, PatientSerializer
from emstrack.tests.util import date2iso, point2str

from login.tests.setup_data import TestSetup


class TestCall(TestSetup):

    def test_call_serializer(self):

        # test CallSerializer
        c1 = Call.objects.create(number="123", street="dunno", updated_by=self.u1)
        serializer = CallSerializer(c1)
        ambulancecalltimeserializer = AmbulanceCallTimeSerializer(many=True)
        result = {
            'id': c1.id,
            'active': c1.active,
            'details': c1.details,
            'priority': c1.priority,
            'number': c1.number,
            'street': c1.street,
            'unit': c1.unit,
            'neighborhood': c1.neighborhood,
            'city': c1.city,
            'state': c1.state,
            'zipcode': c1.zipcode,
            'country': c1.country,
            'location': point2str(c1.location),
            'created_at': date2iso(c1.created_at),
            'ended_at': date2iso(c1.ended_at),
            'comment': c1.comment,
            'updated_by': c1.updated_by.id,
            'updated_on': date2iso(c1.updated_on),
            'ambulancecalltime_set': ambulancecalltimeserializer.data
        }
        self.assertDictEqual(serializer.data, result)

    def test_patient_serializer(self):

        # test PatientSerializer
        c1 = Call.objects.create(number="123", street="dunno", updated_by=self.u1)
        p1 = Patient.objects.create(call=c1)
        serializer = PatientSerializer(p1)
        result = {
            'id': p1.id,
            'call_id': p1.call.id,
            'name': p1.name,
            'age': p1.age
        }
        self.assertDictEqual(serializer.data, result)

    def test_ambulance_call_time_serializer(self):

        c1 = Call.objects.create(number="123", street="dunno", updated_by =
                self.u1)
        ambCallTime = AmbulanceCallTime.objects.create(call=c1, ambulance =
                self.a1)
        serializer = AmbulanceCallTimeSerializer(ambCallTime)
        result = {
            'id': ambCallTime.id,
            'call_id': ambCallTime.call.id,
            'ambulance_id': ambCallTime.ambulance.id,
            'dispatch_time': date2iso(ambCallTime.dispatch_time),
            'departure_time': date2iso(ambCallTime.departure_time),
            'patient_time': date2iso(ambCallTime.patient_time),
            'hospital_time': date2iso(ambCallTime.hospital_time),
            'end_time': date2iso(ambCallTime.end_time)
        }
        self.assertDictEqual(serializer.data, result)