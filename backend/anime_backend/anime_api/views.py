"""
Модуль представлень (views) для додатка anime_api із новою нормалізованою структурою.
"""
import logging

import requests
from django.db.models import Count, Q
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Anime, Comment, GlobalAnimeStats, UserAnimeInteraction
from .recommendation_service import get_collaborative_recommendations

logger = logging.getLogger('anime_api')

RESTRICTED_GENRES = {'hentai', 'erotica', 'ecchi', '18+', 'хентай', 'еротика', 'етті', 'еччі', 'nsfw'}


def is_safe_anime(anime_data):
    genres = anime_data.get('genres', [])
    if isinstance(genres, str):
        genres = [g.strip() for g in genres.split(',')]
    if not genres:
        return True
    for genre in genres:
        g_name = genre.get('name', '') if isinstance(genre, dict) else str(genre)
        g_name_lower = g_name.lower().strip()
        if g_name_lower in RESTRICTED_GENRES:
            return False
        for restricted in RESTRICTED_GENRES:
            if restricted in g_name_lower:
                return False
    return True


class AnimeViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _format_response(self, interaction):
        anime = interaction.anime
        stats, _ = GlobalAnimeStats.objects.get_or_create(anime=anime)
        
        return {
            'id': interaction.id,
            'anihubId': str(anime.anihub_id),
            'anihub_id': str(anime.anihub_id),
            'titleUkrainian': anime.title_ukrainian,
            'title_ukrainian': anime.title_ukrainian,
            'description': anime.description,
            'poster': anime.poster,
            'genres': anime.genres,
            'year': anime.year,
            'episodesCount': anime.episodes_count,
            'type': anime.type,
            'has_ukrainian_dub': anime.has_ukrainian_dub,
            'rating': str(anime.rating), 
            'site_rating': str(stats.bayesian_rating), 
            'userRating': interaction.user_rating,
            'user_rating': interaction.user_rating,
            'isFavorite': interaction.is_favorite,
            'is_favorite': interaction.is_favorite,
            'isWatching': interaction.is_watching,
            'is_watching': interaction.is_watching,
            'isWatched': interaction.in_watchlist,
            'in_watchlist': interaction.in_watchlist,
            'planned': interaction.planned,
            'isAddedByUser': interaction.is_added_by_user
        }

    def list(self, request):
        queryset = UserAnimeInteraction.objects.filter(user=request.user).select_related('anime')
        return Response([self._format_response(item) for item in queryset])

    def create(self, request):
        data = request.data
        aid = data.get('anihubId') or data.get('anihub_id') or data.get('id')
        if not aid:
            return Response({"error": "anihubId is required"}, status=400)
        
        title = data.get('titleUkrainian') or data.get('title_ukrainian') or data.get('title')
        anime, _ = Anime.objects.get_or_create(
            anihub_id=int(aid),
            defaults={
                'title_ukrainian': title, 'description': data.get('description', ''),
                'poster': data.get('poster') or data.get('image'), 'genres': data.get('genres', []),
                'year': data.get('year'), 'episodes_count': data.get('episodesCount') or data.get('episodes') or 0,
                'type': data.get('type', ''), 'has_ukrainian_dub': data.get('has_ukrainian_dub', False),
                'rating': data.get('rating', 0.00)
            }
        )

        interaction, _ = UserAnimeInteraction.objects.get_or_create(user=request.user, anime=anime)
        interaction.is_favorite = data.get('isFavorite', interaction.is_favorite)
        interaction.is_watching = data.get('isWatching', interaction.is_watching)
        interaction.in_watchlist = data.get('isWatched', interaction.in_watchlist)
        interaction.planned = data.get('planned', interaction.planned)
        ur = data.get('userRating', interaction.user_rating)
        interaction.user_rating = int(float(ur)) if ur else 0
        interaction.save()

        return Response(self._format_response(interaction), status=201)

    def partial_update(self, request, pk=None):
        interaction = get_object_or_404(UserAnimeInteraction, user=request.user, pk=pk)
        data = request.data
        
        if 'userRating' in data or 'user_rating' in data:
            ur = data.get('userRating') or data.get('user_rating')
            interaction.user_rating = int(float(ur)) if ur else 0
            
        interaction.is_favorite = data.get('isFavorite', interaction.is_favorite)
        interaction.is_watching = data.get('isWatching', interaction.is_watching)
        interaction.in_watchlist = data.get('isWatched', interaction.in_watchlist)
        interaction.planned = data.get('planned', interaction.planned)
        interaction.save()
        return Response(self._format_response(interaction))

    def destroy(self, request, pk=None):
        interaction = get_object_or_404(UserAnimeInteraction, user=request.user, pk=pk)
        interaction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def top(self, request):
        stats = GlobalAnimeStats.objects.filter(votes_count__gt=0).order_by('-bayesian_rating')[:20]
        data = [
            {
                'anihubId': s.anime.anihub_id, 
                'titleUkrainian': s.anime.title_ukrainian, 
                'poster': s.anime.poster, 
                'bayesian_rating': str(s.bayesian_rating), 
                'votes': s.votes_count
            } for s in stats
        ]
        return Response(data)

    @action(
        detail=False, 
        methods=['get', 'post'], 
        url_path='comments/(?P<anihub_id>[^/.]+)', 
        permission_classes=[AllowAny]
    )
    def anime_comments(self, request, anihub_id=None):
        if request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({"error": "Unauthorized"}, status=401)
                
            text = request.data.get('text')
            title = request.data.get('title', f"Аніме {anihub_id}")
            
            if not text:
                return Response({"error": "Text empty"}, status=400)
                
            anime, _ = Anime.objects.get_or_create(anihub_id=anihub_id, defaults={'title_ukrainian': title})
            c = Comment.objects.create(user=request.user, anime=anime, text=text)
            
            return Response(
                {'id': c.id, 'user': c.user.username, 'text': c.text, 'date': c.created_at, 'is_owner': True}, 
                status=201
            )
            
        anime = Anime.objects.filter(anihub_id=anihub_id).first()
        if not anime:
            return Response([])
            
        comments = Comment.objects.filter(anime=anime)
        data = []
        for c in comments:
            data.append({
                'id': c.id, 
                'user': c.user.username, 
                'text': c.text, 
                'date': c.created_at,
                'is_owner': request.user.is_authenticated and c.user == request.user
            })
        return Response(data)

    @action(
        detail=False, 
        methods=['put', 'delete'], 
        url_path='comment/(?P<comment_id>[^/.]+)', 
        permission_classes=[IsAuthenticated]
    )
    def single_comment(self, request, comment_id=None):
        comment = get_object_or_404(Comment, id=comment_id)
        
        if comment.user != request.user:
            return Response({"error": "Forbidden"}, status=403)
            
        if request.method == 'DELETE':
            comment.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        if request.method == 'PUT':
            text = request.data.get('text')
            if not text:
                return Response({"error": "Text empty"}, status=400)
            
            comment.text = text
            comment.save()
            return Response({'id': comment.id, 'text': comment.text})


@api_view(['GET'])
@permission_classes([AllowAny])
def anihub_proxy(request):
    path = request.GET.get('path', '')
    url = f"https://api.anihub.in.ua/{path}"
    params = request.GET.copy()
    if 'path' in params:
        del params['path']
    try:
        res = requests.get(url, params=params, timeout=10)
        data = res.json()
        if isinstance(data, dict):
            if 'items' in data:
                data['items'] = [a for a in data['items'] if is_safe_anime(a)]
            elif 'results' in data:
                data['results'] = [a for a in data['results'] if is_safe_anime(a)]
        elif isinstance(data, list):
            data = [a for a in data if is_safe_anime(a)]
        return JsonResponse(data, safe=False, status=res.status_code)
    except Exception:
        return JsonResponse({"error": "Proxy fail"}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_comment_stats(request):
    """Повертає загальну кількість коментарів юзера та топ-5 аніме, які він коментував"""
    user = request.user
    total_comments = Comment.objects.filter(user=user).count()
    
    stats = Comment.objects.filter(user=user).values(
        'anime__anihub_id', 
        'anime__title_ukrainian', 
        'anime__poster'
    ).annotate(
        comments_count=Count('id')
    ).order_by('-comments_count')[:5]
    
    most_commented = [{
        'anihubId': str(item['anime__anihub_id']),
        'titleUkrainian': item['anime__title_ukrainian'],
        'poster': item['anime__poster'],
        'commentsCount': item['comments_count']
    } for item in stats]
    
    return Response({
        'total_comments': total_comments,
        'most_commented': most_commented
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def recommended_anime(request):
    try:
        user = request.user
        active_interactions = UserAnimeInteraction.objects.filter(
            Q(user=user) & (
                Q(user_rating__gt=0) | Q(is_favorite=True) | 
                Q(is_watching=True) | Q(in_watchlist=True) | Q(planned=True)
            )
        )
        interacted_ids = active_interactions.values_list('anime__anihub_id', flat=True)
        interacted_ids = set(str(aid) for aid in interacted_ids)

        ratings = UserAnimeInteraction.objects.filter(user_rating__gt=0).values(
            'user_id', 'anime__anihub_id', 'user_rating'
        )
        formatted = [
            {
                'user_id': r['user_id'], 
                'anihub_id': r['anime__anihub_id'], 
                'rating': r['user_rating']
            } for r in ratings
        ]

        rec_ids = get_collaborative_recommendations(user.id, formatted)

        if not rec_ids:
            stats = GlobalAnimeStats.objects.filter(votes_count__gt=0).order_by('-bayesian_rating')[:15]
            rec_ids = [s.anime.anihub_id for s in stats]
            
        if not rec_ids:
            return Response([])

        filtered = [rid for rid in rec_ids if str(rid) not in interacted_ids]
        anime_objs = {str(a.anihub_id): a for a in Anime.objects.filter(anihub_id__in=filtered)}

        final = []
        for rid in filtered:
            if str(rid) in anime_objs:
                obj = anime_objs[str(rid)]
                final.append({
                    'id': obj.anihub_id, 'anihubId': str(obj.anihub_id),
                    'titleUkrainian': obj.title_ukrainian, 'poster': obj.poster,
                    'rating': str(obj.rating), 'description': obj.description,
                    'isFavorite': False, 'isWatching': False, 'isWatched': False, 
                    'planned': False, 'userRating': 0
                })
        return Response(final[:15])
    except Exception as e:
        logger.error(f"Rec Error: {e}")
        return Response([])