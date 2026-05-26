from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allow full access only to users with role 'admin'. Read-only for others."""

    def has_permission(self, request, view):
        # Safe methods are allowed for everyone
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        return bool(user and getattr(user, 'role', None) == 'admin')


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow object modifications only to the owner or admin; read-only otherwise.

    Expects the object to have a `user` attribute (e.g. Review.user).
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed for any request
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Admin can do anything
        if getattr(user, 'role', None) == 'admin':
            return True

        # Otherwise only the owner (obj.user) may modify
        owner = getattr(obj, 'user', None)
        return owner == user


class IsSelfOrAdmin(permissions.BasePermission):
    """Allow object modifications only to the user themself or admin."""

    def has_permission(self, request, view):
        # Allow access; object-level check will enforce modifications
        return True

    def has_object_permission(self, request, view, obj):
        # Safe methods allowed
        if request.method in permissions.SAFE_METHODS:
            return True

        user = request.user
        if not user or not user.is_authenticated:
            return False

        if getattr(user, 'role', None) == 'admin':
            return True

        # obj is expected to be a UserProfile instance
        return getattr(obj, 'pk', None) == getattr(user, 'pk', None)
