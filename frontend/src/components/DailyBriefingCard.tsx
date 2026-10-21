import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Compass, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export const DailyBriefingCard: React.FC = () => {
  const [briefing, setBriefing] = useState<string>('');
  const [isAiPowered, setIsAiPowered] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchBriefing = async () => {
    try {
      const data = await api.getDailyBriefing();
      setBriefing(data.briefing);
      setIsAiPowered(data.is_ai_powered);
    } catch (err) {
      console.error('Failed to fetch daily briefing:', err);
      setBriefing('Unable to load briefing at this moment. Please check backend connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBriefing();
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FAF8F4] via-[#F4EFE6] to-[#ECE5D8] border border-cream-300 p-6 shadow-card">
      {/* Decorative subtle ambient circle */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-sage-200/40 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sage-700 text-cream-50 shadow-sm">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900 tracking-tight">
                Daily AI Briefing
              </h3>
              <p className="text-xs text-charcoal-500">
                Inbox synthesis and strategic priorities for today
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isAiPowered
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAiPowered ? 'Gemini AI Active' : 'Intelligent Rule Engine'}
            </span>

            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="p-1.5 rounded-lg text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-200 transition-colors disabled:opacity-50"
              title="Refresh briefing"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-sage-600' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2 py-4">
            <div className="h-4 bg-cream-300/60 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-cream-300/60 rounded animate-pulse w-full" />
            <div className="h-4 bg-cream-300/60 rounded animate-pulse w-5/6" />
          </div>
        ) : (
          <div className="text-sm text-charcoal-700 space-y-3 leading-relaxed whitespace-pre-line font-normal">
            {briefing.split('\n\n').map((paragraph, idx) => {
              // Highlight bold text markdown
              const formatted = paragraph.replace(/\*\*(.*?)\*\*/g, '$1');
              const isHeadline = paragraph.startsWith('**');
              return (
                <p key={idx} className={isHeadline ? 'font-medium text-charcoal-900' : ''}>
                  {formatted}
                </p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
