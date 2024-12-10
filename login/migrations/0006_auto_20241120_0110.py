# Generated by Django 3.0.6 on 2024-11-20 01:10

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('login', '0005_groupprofile_organization'),
    ]

    operations = [
        migrations.AlterField(
            model_name='groupprofile',
            name='organization',
            # Remove default to make "required field"
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='login.Organization', verbose_name='organization'),
        ),
    ]