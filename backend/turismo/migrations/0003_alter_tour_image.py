from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('turismo', '0002_tour'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tour',
            name='image_url',
        ),
        migrations.AddField(
            model_name='tour',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='tours/'),
        ),
    ]
