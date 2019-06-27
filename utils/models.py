from django.db import models
from hashlib import sha256

class PasswordField(models.CharField):
    def __init__(self, **kwargs):
        self.char_field = models.CharField(editable=False, max_length=64, **kwargs)
    
    def __get__(self, instance, owner):
        return self.char_field
    
    def __set__(self, instance, value):
        hasher = sha256()
        hasher.update(value)
        self.char_field = hasher.hexdigest()

    def __eq__(self, other):
        if other is PasswordField:
            return self.char_field == other.char_field
        else:
            hasher = sha256()
            hasher.update(other)
            return self.char_field == hasher.hexdigest()
    
    def __ne__(self, other):
        return not self.__eq__(other)

    def __getattribute__(self, name):
        return object.__getattribute__(self, "char_field").__getattribute__(name)
