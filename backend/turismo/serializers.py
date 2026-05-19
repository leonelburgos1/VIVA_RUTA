from django.contrib.auth.models import User

from rest_framework import serializers

from .models import Place, Review


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


class PlaceSerializer(serializers.ModelSerializer):

    reviews = ReviewSerializer(
        many=True,
        read_only=True
    )

    image_url = serializers.SerializerMethodField()

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