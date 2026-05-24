import numpy as np
import pandas as pd

from .models import GlobalAnimeStats


def get_bayesian_average_ranking(limit=20):
    """
    Байєсівське середнє. Повертає список anihub_id.
    Оскільки ми тепер рахуємо Байєса на рівні бази даних (GlobalAnimeStats)
    при кожній зміні оцінки, нам достатньо просто дістати відсортований топ.
    """
    try:
        # Беремо аніме, які мають хоча б 1 голос, сортуємо за зваженим рейтингом
        stats = GlobalAnimeStats.objects.filter(votes_count__gt=0).order_by('-bayesian_rating')[:limit]
        return [s.anime.anihub_id for s in stats]
    except Exception as e:
        print(f"Помилка отримання зваженого рейтингу: {e}")
        return []

def get_collaborative_recommendations(target_user_id, ratings_data):
    """
    Колаборативна фільтрація (User-Based). 
    Повертає список anihub_id.
    
    Алгоритм:
    1. Знаходить користувачів, які ставили схожі оцінки тим самим аніме.
    2. Вираховує їхню "вагу схожості".
    3. Прогнозує, яку оцінку поставив би цільовий юзер тим аніме, які він ще не бачив,
       але які високо оцінили його "сусіди" за смаками.
    """
    try:
        if not ratings_data:
            return []

        df = pd.DataFrame(ratings_data)
        df['rating'] = df['rating'].astype(float)

        R = df.pivot(index='user_id', columns='anihub_id', values='rating')
        
        if target_user_id not in R.index:
            return []

        user_means = R.mean(axis=1)
        R_centered = R.sub(user_means, axis=0).fillna(0)
        
        sim_matrix = np.dot(R_centered, R_centered.T)
        norms = np.array([np.sqrt(np.diagonal(sim_matrix))])
        
        with np.errstate(divide='ignore', invalid='ignore'):
            sim_users = np.nan_to_num(sim_matrix / norms / norms.T)

        sim_df = pd.DataFrame(sim_users, index=R.index, columns=R.index)
        
        user_sims = sim_df.loc[target_user_id].drop(target_user_id)
        neighbors = user_sims[user_sims > 0]
        
        if neighbors.empty:
            return []

        # Аніме, які наш користувач вже оцінив
        user_seen = R.loc[target_user_id].dropna().index
        # Аніме, які він ще НЕ бачив (доступні для рекомендації)
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