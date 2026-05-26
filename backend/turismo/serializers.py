from django.contrib.auth.hashers import check_password

from rest_framework import exceptions, serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Place, Review, Tour, UserProfile, Booking


# ──────────────────────────────────────────
# AUTH
# ──────────────────────────────────────────

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise exceptions.ValidationError(
                {'detail': 'Email and password are required.'}
            )

        user = UserProfile.objects.filter(email__iexact=email).first()

        if not user or not check_password(password, user.password):
            raise exceptions.AuthenticationFailed('Credenciales inválidas.')

        refresh = RefreshToken.for_user(user)

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


# ──────────────────────────────────────────
# USERS
# ──────────────────────────────────────────

class UserSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(required=False, allow_blank=False)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, required=False)
    currentPassword = serializers.CharField(write_only=True, required=False)
    newPassword = serializers.CharField(write_only=True, required=False)
    role = serializers.ChoiceField(choices=['admin', 'usuario'], required=False)
    phone = serializers.CharField(required=False, allow_blank=True)
    birthDate = serializers.DateField(required=False, allow_null=True)
    department = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, value):
        normalized_email = value.strip().lower()
        queryset = UserProfile.objects.filter(email__iexact=normalized_email)

        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError('Ya existe una cuenta con ese correo.')

        return normalized_email

    def validate(self, attrs):
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'Este campo es obligatorio.'})

        if self.instance is None and not attrs.get('name'):
            raise serializers.ValidationError({'name': 'Este campo es obligatorio.'})

        if self.instance is not None:
            current_password = attrs.get('currentPassword')
            new_password = attrs.get('newPassword')

            if new_password and not current_password:
                raise serializers.ValidationError({
                    'currentPassword': 'La contraseña actual es obligatoria para cambiar la contraseña.'
                })

            if current_password and not self.instance.check_password(current_password):
                raise serializers.ValidationError({
                    'currentPassword': 'La contraseña actual es incorrecta.'
                })

        return attrs

    def create(self, validated_data):
        role = validated_data.get('role', 'usuario')
        password = validated_data.pop('password')
        username = validated_data.get('name', '').strip() or validated_data['email']
        birth_date = validated_data.pop('birthDate', None)
        phone = validated_data.pop('phone', '')
        department = validated_data.pop('department', '')
        city = validated_data.pop('city', '')

        user = UserProfile.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=password,
            role=role,
            phone=phone,
            birth_date=birth_date,
            department=department,
            city=city,
        )

        return user

    def update(self, instance, validated_data):
        if 'name' in validated_data:
            instance.username = validated_data['name'].strip()

        if 'email' in validated_data:
            instance.email = validated_data['email']

        if 'newPassword' in validated_data and validated_data['newPassword']:
            instance.set_password(validated_data['newPassword'])

        if 'role' in validated_data:
            instance.role = validated_data['role']

        if 'phone' in validated_data:
            instance.phone = validated_data['phone']

        if 'birthDate' in validated_data:
            instance.birth_date = validated_data['birthDate']

        if 'department' in validated_data:
            instance.department = validated_data['department']

        if 'city' in validated_data:
            instance.city = validated_data['city']

        instance.save()
        return instance

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'name': instance.username,
            'email': instance.email,
            'role': instance.role,
            'phone': instance.phone,
            'birthDate': instance.birth_date.isoformat() if instance.birth_date else '',
            'department': instance.department,
            'city': instance.city,
        }


# ──────────────────────────────────────────
# REVIEWS
# ──────────────────────────────────────────

class ReviewSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = Review
        fields = '__all__'


# ──────────────────────────────────────────
# TOURS
# ──────────────────────────────────────────

class TourSummarySerializer(serializers.ModelSerializer):

    place_name = serializers.CharField(source='place.title', read_only=True)
    place_location = serializers.CharField(source='place.location', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Tour
        fields = [
            'id', 'title', 'slug', 'price', 'duration',
            'max_spots', 'rating', 'image_url', 'place_name', 'place_location',
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class TourSerializer(serializers.ModelSerializer):

    place_name = serializers.CharField(source='place.title', read_only=True)
    place_location = serializers.CharField(source='place.location', read_only=True)
    place_slug = serializers.CharField(source='place.slug', read_only=True)
    place_short_description = serializers.CharField(source='place.short_description', read_only=True)
    place_image_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Tour
        fields = '__all__'

    def get_place_image_url(self, obj):
        request = self.context.get('request')
        if obj.place.image and request:
            return request.build_absolute_uri(obj.place.image.url)
        return None

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


# ──────────────────────────────────────────
# PLACES
# ──────────────────────────────────────────

class PlaceSerializer(serializers.ModelSerializer):

    reviews = ReviewSerializer(many=True, read_only=True)
    tours = TourSummarySerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    category_label = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Place
        fields = '__all__'

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


# ──────────────────────────────────────────
# BOOKINGS
# ──────────────────────────────────────────

class BookingSerializer(serializers.ModelSerializer):

    user_email = serializers.CharField(source='user.email', read_only=True)
    tour_title = serializers.CharField(source='tour.title', read_only=True)
    tour_slug = serializers.CharField(source='tour.slug', read_only=True)
    tour_duration = serializers.CharField(source='tour.duration', read_only=True)
    tour_place_name = serializers.CharField(source='tour.place.title', read_only=True)
    # imagen del tour para mostrar en la tarjeta de reserva
    tour_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'user_email',
            'tour', 'tour_title', 'tour_slug', 'tour_duration', 'tour_place_name', 'tour_image_url',
            'date', 'guests', 'total_price', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'status', 'created_at', 'updated_at',
            'user_email', 'tour_title', 'tour_slug', 'tour_duration',
            'tour_place_name', 'tour_image_url'
        ]

    def get_tour_image_url(self, obj):
        request = self.context.get('request')
        if obj.tour.image and request:
            return request.build_absolute_uri(obj.tour.image.url)
        # Fallback a imagen del lugar si el tour no tiene imagen propia
        if obj.tour.place.image and request:
            return request.build_absolute_uri(obj.tour.place.image.url)
        return None

    def validate_guests(self, value):
        if value < 1:
            raise serializers.ValidationError('El número de personas debe ser al menos 1.')
        return value

    def validate(self, attrs):
        tour = attrs.get('tour')
        guests = attrs.get('guests', 1)

        if tour and not attrs.get('total_price'):
            attrs['total_price'] = tour.price * guests

        return attrs