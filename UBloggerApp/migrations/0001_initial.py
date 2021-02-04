# Generated by Django 3.0.2 on 2020-03-28 00:56

from django.conf import settings
import django.contrib.auth.models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0011_update_proxy_permissions'),
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('url', models.TextField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=1000)),
                ('description', models.TextField(blank=True, null=True)),
                ('body', models.TextField()),
                ('views', models.IntegerField(default=0)),
                ('published', models.BooleanField(default=False)),
                ('published_on', models.DateTimeField(auto_now_add=True)),
                ('last_modified', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['-published_on'],
            },
        ),
        migrations.CreateModel(
            name='BlogAdmin',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, related_name='blog_admin', serialize=False, to=settings.AUTH_USER_MODEL)),
                ('profile_picture', models.ImageField(null=True, upload_to='profile-pictures')),
                ('display_name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('last_active', models.DateTimeField()),
                ('settings', models.TextField(null=True)),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            bases=('auth.user',),
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('name', models.CharField(max_length=100, primary_key=True, serialize=False)),
            ],
        ),
        migrations.CreateModel(
            name='FileLikeObject',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=512)),
                ('type', models.CharField(max_length=50)),
                ('file', models.FileField(null=True, upload_to='files')),
                ('uploaded_on', models.DateTimeField(auto_now_add=True)),
                ('parent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='UBloggerApp.FileLikeObject')),
            ],
        ),
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('name', models.CharField(max_length=100, primary_key=True, serialize=False)),
            ],
        ),
        migrations.CreateModel(
            name='GalleryImage',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('image', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='UBloggerApp.FileLikeObject')),
            ],
            options={
                'ordering': ['-pk'],
            },
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('date', models.DateTimeField()),
                ('notes', models.TextField()),
                ('picture', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='UBloggerApp.FileLikeObject')),
            ],
            options={
                'ordering': ['-pk'],
            },
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('text', models.TextField()),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('article', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='UBloggerApp.Article')),
                ('reference', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='UBloggerApp.Comment')),
            ],
            options={
                'ordering': ['-pk'],
            },
        ),
        migrations.AddField(
            model_name='article',
            name='by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='UBloggerApp.BlogAdmin'),
        ),
        migrations.AddField(
            model_name='article',
            name='category',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='UBloggerApp.Category'),
        ),
        migrations.AddField(
            model_name='article',
            name='cover_photo',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='UBloggerApp.FileLikeObject'),
        ),
        migrations.AddField(
            model_name='article',
            name='tags',
            field=models.ManyToManyField(to='UBloggerApp.Tag'),
        ),
    ]