from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator

phone_validator = RegexValidator(
    regex=r"^\d{10}$",
    message="Phone number must be exactly 10 digits."
)


class Student(models.Model):
    DEPARTMENT_CHOICES = [
        ("CSE", "Computer Science and Engineering"),
        ("AIML", "AI & Machine Learning"),
        ("ECE", "Electronics and Communication"),
        ("EEE", "Electrical and Electronics"),
        ("MECH", "Mechanical Engineering"),
        ("CIVIL", "Civil Engineering"),
        ("IT", "Information Technology"),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    department = models.CharField(max_length=10, choices=DEPARTMENT_CHOICES)
    year = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    phone = models.CharField(max_length=10, validators=[phone_validator])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.department})"
