from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('turismo', '0003_alter_tour_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='place',
            name='category',
            field=models.CharField(
                choices=[
                    ('Nature', 'Naturaleza'),
                    ('Religious', 'Religioso'),
                    ('Adventure', 'Aventura'),
                    ('Culture', 'Cultura'),
                    ('Gastronomy', 'Gastronomía'),
                    ('Beach', 'Playa'),
                ],
                max_length=80,
            ),
        ),
    ]
