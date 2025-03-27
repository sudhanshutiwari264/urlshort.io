from flask import Flask, request, jsonify, send_from_directory
from ytmusicapi import YTMusic
import json
import os
import sys

app = Flask(__name__)

# Initialize YTMusic API - unauthenticated for search operations
ytmusic = YTMusic()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join('..', path)):
        return send_from_directory('..', path)
    else:
        return send_from_directory('..', 'index.html')

@app.route('/api/search', methods=['GET'])
def search_tracks():
    query = request.args.get('query', '')
    limit = request.args.get('limit', 10, type=int)
    
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400
    
    try:
        # Search for tracks with the query
        results = ytmusic.search(query, filter="songs", limit=limit)
        
        # Format the results for our frontend
        formatted_results = []
        for item in results:
            if item['resultType'] == 'song':
                track = {
                    'id': f"ytmusic-{item['videoId']}",
                    'title': item['title'],
                    'artist': item['artists'][0]['name'] if item['artists'] else "Unknown Artist",
                    'album': item['album']['name'] if 'album' in item and item['album'] else "",
                    'cover': item['thumbnails'][-1]['url'] if item['thumbnails'] else "",
                    'duration': item.get('duration', ""),
                    'videoId': item['videoId'],
                    'sourceType': 'ytmusic'
                }
                formatted_results.append(track)
        
        return jsonify(formatted_results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/mood', methods=['GET'])
def get_mood_playlists():
    mood = request.args.get('mood', '')
    limit = request.args.get('limit', 8, type=int)
    
    # Map moods to YouTube Music search terms
    mood_map = {
        'happy': 'happy music',
        'sad': 'sad music',
        'energetic': 'energetic music',
        'relaxed': 'relaxing music',
        'focused': 'focus music',
        'angry': 'intense music',
        'romantic': 'romantic music'
    }
    
    search_term = mood_map.get(mood, mood + ' music')
    
    try:
        # Search for tracks related to the mood
        results = ytmusic.search(search_term, filter="songs", limit=limit)
        
        # Format the results for our frontend
        formatted_results = []
        for item in results:
            if item['resultType'] == 'song':
                track = {
                    'id': f"ytmusic-{item['videoId']}",
                    'title': item['title'],
                    'artist': item['artists'][0]['name'] if item['artists'] else "Unknown Artist",
                    'album': item['album']['name'] if 'album' in item and item['album'] else "",
                    'cover': item['thumbnails'][-1]['url'] if item['thumbnails'] else "",
                    'duration': item.get('duration', ""),
                    'videoId': item['videoId'],
                    'sourceType': 'ytmusic'
                }
                formatted_results.append(track)
        
        return jsonify(formatted_results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/artist', methods=['GET'])
def get_artist_tracks():
    artist = request.args.get('artist', '')
    limit = request.args.get('limit', 8, type=int)
    
    if not artist:
        return jsonify({"error": "Artist parameter is required"}), 400
    
    try:
        # Search for the artist
        artist_results = ytmusic.search(artist, filter="artists", limit=1)
        
        if not artist_results:
            return jsonify([])
        
        # Get the artist's top tracks
        artist_id = artist_results[0]['browseId']
        artist_info = ytmusic.get_artist(artist_id)
        
        # Extract tracks from the artist's page
        tracks = []
        for section in artist_info['sections']:
            if 'songs' in section['title'].lower() or 'popular' in section['title'].lower():
                tracks = section.get('contents', [])
                break
        
        # Format the results for our frontend
        formatted_results = []
        for item in tracks[:limit]:
            if 'videoId' in item:
                track = {
                    'id': f"ytmusic-{item['videoId']}",
                    'title': item['title'],
                    'artist': artist,
                    'album': item.get('album', {}).get('name', "") if 'album' in item else "",
                    'cover': item['thumbnails'][-1]['url'] if 'thumbnails' in item and item['thumbnails'] else "",
                    'duration': item.get('duration', ""),
                    'videoId': item['videoId'],
                    'sourceType': 'ytmusic'
                }
                formatted_results.append(track)
        
        return jsonify(formatted_results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/genres', methods=['GET'])
def get_genre_playlists():
    genre = request.args.get('genre', '')
    limit = request.args.get('limit', 8, type=int)
    
    if not genre:
        return jsonify({"error": "Genre parameter is required"}), 400
    
    try:
        # Search for tracks in the genre
        results = ytmusic.search(f"{genre} music", filter="songs", limit=limit)
        
        # Format the results for our frontend
        formatted_results = []
        for item in results:
            if item['resultType'] == 'song':
                track = {
                    'id': f"ytmusic-{item['videoId']}",
                    'title': item['title'],
                    'artist': item['artists'][0]['name'] if item['artists'] else "Unknown Artist",
                    'album': item['album']['name'] if 'album' in item and item['album'] else "",
                    'cover': item['thumbnails'][-1]['url'] if item['thumbnails'] else "",
                    'duration': item.get('duration', ""),
                    'videoId': item['videoId'],
                    'sourceType': 'ytmusic'
                }
                formatted_results.append(track)
        
        return jsonify(formatted_results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Vercel serverless function handler
def handler(event, context):
    return app(event, context)

# For local development
if __name__ == '__main__':
    app.run(debug=True, port=5000)