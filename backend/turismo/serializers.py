from django.contrib.auth.models import User

from rest_framework import serializers

from .models import Place, Review, Tour


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):

    user_name = serializers.CharField(
        source='user.username',
        read_only=True
    )

    class Meta:
        model = Review
        fields = '__all__'


class TourSummarySerializer(serializers.ModelSerializer):

    place_name = serializers.CharField(
        source='place.title',
        read_only=True
    )

    place_location = serializers.CharField(
        source='place.location',
        read_only=True
    )

    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Tour
        fields = [
            'id',
            'title',
            'slug',
            'price',
            'duration',
            'max_spots',
            'rating',
            'image_url',
            'place_name',
            'place_location',
        ]

    def get_image_url(self, obj):

        request = self.context.get('request')

        if obj.image:

            return request.build_absolute_uri(
                obj.image.url
            )

        return None


class PlaceSerializer(serializers.ModelSerializer):

    reviews = ReviewSerializer(
        many=True,
        read_only=True
    )

    tours = TourSummarySerializer(
        many=True,
        read_only=True
    )

    image_url = serializers.SerializerMethodField()
    category_label = serializers.CharField(
        source='get_category_display',
        read_only=True
    )

    class Meta:
        model = Place
        fields = '__all__'

    def get_image_url(self, obj):

        request = self.context.get('request')

        if obj.image:

            return request.build_absolute_uri(
                obj.image.url
            )

        return None


class TourSerializer(serializers.ModelSerializer):

    place_name = serializers.CharField(
        source='place.title',
        read_only=True
    )

    place_location = serializers.CharField(
        source='place.location',
        read_only=True
    )

    place_slug = serializers.CharField(
        source='place.slug',
        read_only=True
    )

    place_short_description = serializers.CharField(
        source='place.short_description',
        read_only=True
    )

    place_image_url = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Tour
        fields = '__all__'

    def get_place_image_url(self, obj):

        request = self.context.get('request')

        if obj.place.image:

            return request.build_absolute_uri(
                obj.place.image.url
            )

        return None

    def get_image_url(self, obj):

        request = self.context.get('request')

        if obj.image:

            return request.build_absolute_uri(
                obj.image.url
            )

        return None
