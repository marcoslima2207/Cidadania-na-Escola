def user_display_name(user):
    """Nome público independente do identificador usado para autenticar a conta."""
    return user.get_full_name().strip() or user.username
