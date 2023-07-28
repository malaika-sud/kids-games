import datetime
from .common import db, Field, auth
from pydal.validators import *


def get_user_email():
    return auth.current_user.get('email') if auth.current_user else None
def get_username():
    return auth.current_user.get('username') if auth.current_user else None
def get_time():
    return datetime.datetime.utcnow()

#this table holds the user id, username, points earned, and time of the hangdude game's leaderboard
db.define_table(
    # name of table is: hangdude_leaderboard
    'hangdude_leaderboard',
    Field('users_id', 'reference auth_user', default=lambda: auth.user_id, writable=False),
    Field('users_name'),
    Field('points', 'integer'),
    Field('time', "datetime", IS_DATETIME())
)

#this table holds the user id, username, points earned, and time of the termsearch game's leaderboard
db.define_table(
    # name of table is: termsearch_leaderboard
    'termsearch_leaderboard',
    Field('users_id', 'reference auth_user', default=lambda: auth.user_id, writable=False),
    Field('users_name'),
    Field('points', 'integer'),
    Field('time', "datetime", IS_DATETIME())
)

#this table holds the user id, how many times user played the games
#this table holds the user id, how many times user played termsearch, how many times user played hangdude
db.define_table(
    # name of table is: history
    'history',
    Field('users_id', 'reference auth_user', default=lambda: auth.user_id, writable=False),
    Field('hangdude_played', 'integer'),
    Field('termsearch_played', 'integer')
)

db.commit()
