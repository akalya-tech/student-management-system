from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend

from .models import Student
from .serializers import StudentSerializer


class StudentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/students/       -> list all students (supports ?search= and ?department=)
    POST /api/students/       -> create a new student
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["department", "year"]
    search_fields = ["name", "email"]
    ordering_fields = ["name", "year", "created_at"]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as exc:
            return Response(
                {"error": "Validation failed", "details": exc.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/students/<id>/  -> retrieve one student
    PUT    /api/students/<id>/  -> full update
    PATCH  /api/students/<id>/  -> partial update
    DELETE /api/students/<id>/  -> delete
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer

    def update(self, request, *args, **kwargs):
        try:
            return super().update(request, *args, **kwargs)
        except ValidationError as exc:
            return Response(
                {"error": "Validation failed", "details": exc.detail},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name = instance.name
        self.perform_destroy(instance)
        return Response(
            {"message": f"Student '{name}' deleted successfully."},
            status=status.HTTP_200_OK,
        )
