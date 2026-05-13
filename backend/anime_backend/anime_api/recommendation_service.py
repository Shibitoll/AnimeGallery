import numpy as np
import pandas as pd
from django.db.models import Avg, Count


def get_bayesian_average_ranking(anime_queryset):
    """
    Байєсівське середнє. Повертає список anihub_id.
    """
    try:
        global_stats = anime_queryset.aggregate(C=Avg('user_rating'))
        C = float(global_stats['C'] or 0)

        votes_counts = list(anime_queryset.values('anihub_id').annotate(v=Count('id')).values_list('v', flat=True))
        m = float(np.quantile(votes_counts, 0.25)) if votes_counts else 0.0

        unique_animes = anime_queryset.values('anihub_id').annotate(
            v=Count('id'), 
            R=Avg('user_rating')
        )

        ranked = []
        for anime in unique_animes:
            v = float(anime['v'])
            R = float(anime['R'] or 0)
            
            wr = (v / (v + m)) * R + (m / (v + m)) * C if (v + m) > 0 else 0
            ranked.append({'anihub_id': anime['anihub_id'], 'wr': wr})

        ranked.sort(key=lambda x: x['wr'], reverse=True)
        return [x['anihub_id'] for x in ranked[:20]]
    except Exception as e:
        print(f"Помилка байєсівського середнього: {e}")
        return []

def get_collaborative_recommendations(target_user_id, ratings_data):
    """
    Колаборативна фільтрація. Повертає список anihub_id.
    """
    try:
        if not ratings_data:
            return []

        df = pd.DataFrame(ratings_data)
        # Броньований захист від конфлікту типів (Decimal vs Float)
        df['rating'] = df['rating'].astype(float)

        R = df.pivot(index='user_id', columns='anihub_id', values='rating')
        user_means = R.mean(axis=1)
        R_centered = R.sub(user_means, axis=0).fillna(0)
        
        sim_matrix = np.dot(R_centered, R_centered.T)
        norms = np.array([np.sqrt(np.diagonal(sim_matrix))])
        
        with np.errstate(divide='ignore', invalid='ignore'):
            sim_users = np.nan_to_num(sim_matrix / norms / norms.T)

        sim_df = pd.DataFrame(sim_users, index=R.index, columns=R.index)
        
        if target_user_id not in sim_df.index:
            return []

        user_sims = sim_df.loc[target_user_id].drop(target_user_id)
        neighbors = user_sims[user_sims > 0]
        
        if neighbors.empty:
            return []

        user_seen = R.loc[target_user_id].dropna().index
        unseen = R.columns.difference(user_seen)
        
        preds = {}
        for aid in unseen:
            neigh_rated = R_centered.loc[neighbors.index, aid].dropna()
            if neigh_rated.empty:
                continue
                
            sim_sum = neighbors.loc[neigh_rated.index].sum()
            if sim_sum == 0:
                continue
                
            w_sum = (neighbors.loc[neigh_rated.index] * neigh_rated).sum()
            preds[aid] = user_means[target_user_id] + (w_sum / sim_sum)
            
        sorted_preds = sorted(preds.items(), key=lambda x: x[1], reverse=True)
        return [aid for aid, rating in sorted_preds][:20]
    except Exception as e:
        print(f"Помилка колаборативної фільтрації: {e}")
        return []