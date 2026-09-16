from django.contrib import admin
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "department", "year", "phone"]
    search_fields = ["name", "email"]
    list_filter = ["department", "year"]
