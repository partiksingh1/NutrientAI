import { useState, useEffect } from 'react';
import { getNutritionTrends, getProgressAnalytics, ProgressAnalytics, TrendsResponse } from '@/services/analyticsService';

export type Period = 'week' | 'month' | 'quarter';

export const useAnalytics = (period: Period = 'week') => {
    const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
    const [trends, setTrends] = useState<TrendsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            setError(null);

            const [analyticsData, trendsData] = await Promise.all([
                getProgressAnalytics(period),
                getNutritionTrends(period)
            ]);

            setAnalytics(analyticsData);
            setTrends(trendsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [period]);

    const refetch = () => {
        fetchAnalytics();
    };

    return {
        analytics,
        trends,
        loading,
        error,
        refetch
    };
};
