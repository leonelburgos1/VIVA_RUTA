from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('turismo', '0002_remove_userprofile_is_active_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='userprofile',
            name='last_login',
        ),
    ]
