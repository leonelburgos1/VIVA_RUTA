from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('turismo', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tour',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=180)),
                ('slug', models.SlugField(blank=True, unique=True)),
                ('description', models.TextField()),
                ('price', models.PositiveIntegerField()),
                ('duration', models.CharField(max_length=80)),
                ('max_spots', models.PositiveIntegerField()),
                ('schedule', models.CharField(max_length=180)),
                ('includes', models.JSONField(blank=True, default=list)),
                ('image_url', models.URLField(blank=True)),
                ('rating', models.FloatField(default=4.8)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('place', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tours', to='turismo.place')),
            ],
        ),
    ]
