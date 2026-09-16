from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Student


class StudentCRUDTests(APITestCase):
    def setUp(self):
        self.list_url = reverse("student-list-create")
        self.valid_payload = {
            "name": "Akalya Arthanari",
            "email": "akalya@example.com",
            "department": "AIML",
            "year": 2,
            "phone": "9876543210",
        }

    def test_create_student_valid(self):
        response = self.client.post(self.list_url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Student.objects.count(), 1)

    def test_create_student_missing_name(self):
        payload = self.valid_payload.copy()
        payload["name"] = ""
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_student_duplicate_email(self):
        self.client.post(self.list_url, self.valid_payload, format="json")
        response = self.client.post(self.list_url, self.valid_payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_student_invalid_phone(self):
        payload = self.valid_payload.copy()
        payload["phone"] = "12345"
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_read_all_students(self):
        self.client.post(self.list_url, self.valid_payload, format="json")
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_read_single_student(self):
        create_resp = self.client.post(self.list_url, self.valid_payload, format="json")
        student_id = create_resp.data["id"]
        detail_url = reverse("student-detail", args=[student_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_read_invalid_id(self):
        detail_url = reverse("student-detail", args=[9999])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_student(self):
        create_resp = self.client.post(self.list_url, self.valid_payload, format="json")
        student_id = create_resp.data["id"]
        detail_url = reverse("student-detail", args=[student_id])
        response = self.client.patch(detail_url, {"year": 3}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["year"], 3)

    def test_update_invalid_id(self):
        detail_url = reverse("student-detail", args=[9999])
        response = self.client.patch(detail_url, {"year": 3}, format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_student(self):
        create_resp = self.client.post(self.list_url, self.valid_payload, format="json")
        student_id = create_resp.data["id"]
        detail_url = reverse("student-detail", args=[student_id])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Student.objects.count(), 0)

    def test_delete_invalid_id(self):
        detail_url = reverse("student-detail", args=[9999])
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
