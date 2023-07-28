from py4web import action, request, abort, redirect, URL
from yatl.helpers import A
from .common import db, session, T, cache, auth, logger, authenticated, unauthenticated, flash
from py4web.utils.url_signer import URLSigner
from .models import get_user_email, get_username
from py4web.utils.form import Form, FormStyleBulma
import random
from .settings import APP_FOLDER
import datetime
import os
filename = os.path.join(APP_FOLDER, "data", "stanford-5-letter-words.txt")
url_signer = URLSigner(session)

from .settings import APP_FOLDER

#get all words in txt into a array so we only need to process it once
word_array = []
with open(filename, 'r') as file:
    word_array = file.read().splitlines()
    
@action('index')
@action.uses('index.html', db, auth.user)
def index():
    return dict()

#gets the users history for the index page so they can see how many times they played
@action('get_user_history')
@action.uses(db, auth.user)
def get_user_history():
    history = db(db.history.users_id == auth.user_id).select().as_list()
    if(history == [] or history == None):
       db.history.insert(users_id = auth.user_id, hangdude_played = 0, termsearch_played = 0)
       db.commit()
    result = db(db.history.users_id == auth.user_id).select().as_list()
    return dict(result=result)

#the hangdude game html page
@action('hangdude')
@action.uses('hangdude.html', db, auth.user)
def hangdude():
    
    return dict()

#the termsearch game html page
@action('termsearch')
@action.uses('termsearch.html', db, auth.user)
def termsearch():
    
    return dict()

#the termsearch leaderboard html page
@action('termsearch/leaderboard')
@action.uses('termsearch_leaderboard.html' , db, auth.user)
def termsearch_leaderboard():
    
    return dict()

#the hangdude leaderboard html page
@action('hangdude/leaderboard')
@action.uses('hangdude_leaderboard.html' , db, auth.user)
def hangdude_leaderboard():
    
    return dict()

#this method is called when the user wins a game of hangdude, regardless as to whether or not they won the full points
#or not, gives the user with that particular username points according to how much they earned during that round
#also adds on to the fact that this user has played one more round of hangdude
@action('post_won_hangdude', method="POST")
@action.uses(db, auth.user)
def post_won_hangdude():
    
    hangdude = request.json
    score = hangdude.get("score")
    now = datetime.datetime.utcnow()

    username = get_username()

    #selects the row in hangdude leaderboard that matches the current user's username, fixed the error with duplicating 
    #a username in the top 10 leaderboards
    existing_row = db(db.hangdude_leaderboard.users_name == username).select().first()

    if existing_row: #if username already in a row in the leaderboard, update the current score with new one
        current_score = existing_row.points
        new_score = current_score + score
        db(db.hangdude_leaderboard.users_name == username).update(points=new_score, time=now)
        db.commit()
    else:  #inserts the score regularly if username not already in leaderboard
        db.hangdude_leaderboard.insert(users_id=auth.user_id, users_name=username, points=score, time=now)

    #updates the history, one more game played
    myquery = (db.history.users_id == auth.user_id)
    myset = db(myquery)
    rows = myset.select()
    myset.update(hangdude_played = rows[0]['hangdude_played'] + 1)
    db.commit()
    return "ok"

#this method is called when the user wins a game of termsearch, regardless as to whether or not they won the full points
#or not, gives the user with that particular username points according to how much they earned during that round
#also adds on to the fact that this user has played one more round of termsearch
@action('post_won_termsearch', method="POST")
@action.uses(db, auth.user)
def post_won_termsearch():
    
    termsearch = request.json
    score = termsearch.get("score")
    now = datetime.datetime.utcnow()

    username = get_username()

    #selects the row in termsearch leaderboard that matches the current user's username, fixed the error with duplicating 
    #a username in the top 10 leaderboards
    existing_row = db(db.termsearch_leaderboard.users_name == username).select().first()

    if existing_row: #if username already in a row in the leaderboard, update the current score with new one
        current_score = existing_row.points
        new_score = current_score + score
        db(db.termsearch_leaderboard.users_name == username).update(points=new_score, time=now)
        db.commit()
    else:  #inserts the score regularly if username not already in leaderboard
        db.termsearch_leaderboard.insert(users_id=auth.user_id, users_name=username, points=score, time=now)

    #updates the history, one more game played
    myquery = (db.history.users_id == auth.user_id)
    myset = db(myquery)
    rows = myset.select()
    myset.update(termsearch_played = rows[0]['termsearch_played'] + 1)
    db.commit()
    return "ok"

#this method is called when a user lost a round of hangdude, therefore they got 0 points but need to update
#that they played a game of hangdude
@action('post_lost_hangdude', method="POST")
@action.uses(db, auth.user)
def post_lost_hangdude():
    #here we update the history, aka show in the records that the user played one new round of hangdude
    myquery = (db.history.users_id == auth.user_id)
    myset = db(myquery)
    rows = myset.select()
    myset.update(hangdude_played = rows[0]['hangdude_played'] + 1)
    db.commit()
    return "ok"

#this method is called when a user lost a round of termsearch, therefore they got 0 points but need to update
#that they played a game of termsearch
@action('post_lost_termsearch', method="POST")
@action.uses(db, auth.user)
def post_lost_termsearch():
    #here we update the history, aka show in the records that the user played one new round of termsearch
    myquery = (db.history.users_id == auth.user_id)
    myset = db(myquery)
    rows = myset.select()
    myset.update(termsearch_played = rows[0]['termsearch_played'] + 1)
    db.commit()
    return "ok"

#gets data for top 10 hangdude users for the hangdude leaderboard page
@action('get_hangdude_leaderboard')
@action.uses(db, auth.user)
def get_hangdude_leaderboard():
    result = db().select(db.hangdude_leaderboard.users_id.with_alias('id'),  db.hangdude_leaderboard.users_name.with_alias('name'), db.hangdude_leaderboard.points.sum().with_alias('points'), groupby = (db.hangdude_leaderboard.users_id|db.hangdude_leaderboard.points), orderby = (~db.hangdude_leaderboard.points.sum()|db.hangdude_leaderboard.users_name)).as_list()

    return dict(result = result)

#gets the data for top 10 termsearch users for the termsearch leaderboard page
@action('get_termsearch_leaderboard')
@action.uses(db, auth.user)
def get_termsearch_leaderboard():
    result = db().select(db.termsearch_leaderboard.users_id.with_alias('id'),  db.termsearch_leaderboard.users_name.with_alias('name'), db.termsearch_leaderboard.points.sum().with_alias('points'), groupby = (db.termsearch_leaderboard.users_id|db.termsearch_leaderboard.points), orderby = (~db.termsearch_leaderboard.points.sum()|db.termsearch_leaderboard.users_name)).as_list()

    return dict(result = result)

#getting a single random word for the games
@action('get_word')
@action.uses(auth.user)
def get_word():
    word = random.choice(word_array)
    return dict(word=word)

#getting 3 words for termsearch, similar to the get_word function
@action('get_3_words')
@action.uses(auth.user)
def get_3_words():
    words = []
    for x in range(3):
        word = random.choice(word_array).upper() #generates random word from txt file and converts to uppercase to match the map
        words.append(word) #adding word to the array
    return dict(words=words)