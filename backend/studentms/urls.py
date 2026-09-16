from django.contrib import admin
from django.urls import path, re_path, include
from django.views.static import serve
from django.conf import settings

# The frontend folder sits alongside the backend folder
FRONTEND_DIR = settings.BASE_DIR.parent / "frontend"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("students.urls")),

    # Serve the frontend from the same origin as the API (development only).
    # This means everything runs on http://127.0.0.1:8000/ with no CORS issues.
    path("", serve, {"document_root": FRONTEND_DIR, "path": "index.html"}),
    re_path(r"^(?P<path>.*)$", serve, {"document_root": FRONTEND_DIR}),
]
