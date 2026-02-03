import React, { useMemo } from 'react';
import { X, Flame, CheckCircle, Zap, Trophy, Heart, Brain, Home, Briefcase, Users } from 'lucide-react';
import type { Player, QuestHistory, CategoryType } from '../types/types';

const categoryIcons: Record<CategoryType, any> = {
  body: Heart,
  mind: Brain,
  environment: Home,
  projects: Briefcase,
  social: Users,
};
const categoryLabels: Record<CategoryType, string> = {
  body: 'Corps',
  mind: 'Esprit',
  environment: 'Environnement',
  projects: 'Projets',
  social: 'Social',
};
const categoryColors: Record<CategoryType, string> = {
  body: 'bg-red-500',
  mind: 'bg-purple-500',
  environment: 'bg-green-500',
  projects: 'bg-blue-500',
  social: 'bg-yellow-500',
};

interface ProgressDashboardProps {
  player: Player;
  history: QuestHistory[];
  onClose: () => void;
}

const developmentLevelPercent: Record<string, number> = {
  none: 0,
  low: 25,
  medium: 50,
  high: 75,
  advanced: 100,
};

const developmentLevelLabel: Record<string, string> = {
  none: 'Nouveau',
  low: 'Debutant',
  medium: 'Intermediaire',
  high: 'Avance',
  advanced: 'Expert',
};

function computeStreak(history: QuestHistory[]): number {
  if (history.length === 0) return 0;

  const uniqueDates = new Set(
    history.map((h) => h.date.split('T')[0])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Start from today or yesterday
  let startDate: Date;
  if (uniqueDates.has(todayStr)) {
    startDate = new Date(today);
  } else if (uniqueDates.has(yesterdayStr)) {
    startDate = new Date(yesterday);
  } else {
    return 0;
  }

  let streak = 0;
  const current = new Date(startDate);
  while (true) {
    const dateStr = current.toISOString().split('T')[0];
    if (uniqueDates.has(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function getActivityMap(history: QuestHistory[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const h of history) {
    const date = h.date.split('T')[0];
    map.set(date, (map.get(date) || 0) + 1);
  }
  return map;
}

function getWeekStats(history: QuestHistory[]): { thisWeek: number; lastWeek: number } {
  const now = new Date();
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Monday = 1
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  let thisWeek = 0;
  let lastWeek = 0;

  for (const h of history) {
    const d = new Date(h.date);
    if (d >= startOfWeek) thisWeek++;
    else if (d >= startOfLastWeek) lastWeek++;
  }

  return { thisWeek, lastWeek };
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ player, history, onClose }) => {
  const streak = computeStreak(history);
  const activityMap = getActivityMap(history);
  const weekStats = getWeekStats(history);

  // Category stats
  const categoryStats = useMemo(() => {
    const stats: Record<CategoryType, number> = { body: 0, mind: 0, environment: 0, projects: 0, social: 0 };
    history.forEach(q => {
      if (q.category && stats[q.category] !== undefined) {
        stats[q.category]++;
      }
    });
    return stats;
  }, [history]);
  const maxCategoryStat = Math.max(...Object.values(categoryStats), 1);

  // Calendar: last 12 weeks
  const calendarWeeks: { date: Date; dateStr: string; count: number }[][] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the Monday of the current week
  const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const endMonday = new Date(today);
  endMonday.setDate(today.getDate() - dayOfWeek + 1);

  // Go back 11 weeks to get 12 weeks total
  const startMonday = new Date(endMonday);
  startMonday.setDate(startMonday.getDate() - 11 * 7);

  for (let w = 0; w < 12; w++) {
    const week: { date: Date; dateStr: string; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startMonday);
      date.setDate(startMonday.getDate() + w * 7 + d);
      const dateStr = date.toISOString().split('T')[0];
      week.push({ date, dateStr, count: activityMap.get(dateStr) || 0 });
    }
    calendarWeeks.push(week);
  }

  const getActivityColor = (count: number): string => {
    if (count === 0) return 'bg-white/5';
    if (count === 1) return 'bg-purple-500/30';
    if (count === 2) return 'bg-purple-500/50';
    return 'bg-purple-500/80';
  };

  // Average quests per day
  const firstQuestDate = history.length > 0
    ? new Date(history.reduce((min, h) => h.date < min ? h.date : min, history[0].date))
    : null;
  const daysSinceStart = firstQuestDate
    ? Math.max(1, Math.ceil((Date.now() - firstQuestDate.getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const avgPerDay = history.length > 0 ? (history.length / daysSinceStart).toFixed(1) : '0';

  // Week comparison
  const weekDiff = weekStats.lastWeek > 0
    ? Math.round(((weekStats.thisWeek - weekStats.lastWeek) / weekStats.lastWeek) * 100)
    : weekStats.thisWeek > 0 ? 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border-2 border-purple-500/50 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold">Ma progression</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Stats overview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/20 rounded-xl p-4 text-center">
              <CheckCircle className="mx-auto mb-2 text-purple-400" size={24} />
              <p className="text-2xl font-bold">{player.questsCompleted}</p>
              <p className="text-xs text-gray-400">Quetes completees</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 text-center">
              <Trophy className="mx-auto mb-2 text-yellow-400" size={24} />
              <p className="text-2xl font-bold">{player.perfectDays}</p>
              <p className="text-xs text-gray-400">Journees parfaites</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 text-center">
              <Zap className="mx-auto mb-2 text-red-400" size={24} />
              <p className="text-2xl font-bold">{player.hardQuestsCompleted}</p>
              <p className="text-xs text-gray-400">Quetes difficiles</p>
            </div>
            <div className="bg-black/20 rounded-xl p-4 text-center">
              <Flame className="mx-auto mb-2 text-orange-400" size={24} />
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-gray-400">Serie actuelle (jours)</p>
            </div>
          </div>

          {/* Section 2: Activity calendar */}
          <div>
            <h4 className="font-bold mb-3">Activite (12 semaines)</h4>
            {/* Month labels */}
            <div className="flex gap-[3px] mb-1 ml-7">
              {calendarWeeks.map((week, wi) => {
                const monday = week[0].date;
                const monthName = monday.toLocaleDateString('fr-FR', { month: 'short' });
                const showLabel = wi === 0 || monday.getMonth() !== calendarWeeks[wi - 1][0].date.getMonth();
                return (
                  <div key={wi} className="flex-1 text-[10px] text-gray-500 truncate">
                    {showLabel ? monthName : ''}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[3px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[3px] shrink-0 w-6">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((label, i) => (
                  <div key={i} className="aspect-square flex items-center justify-center text-[10px] text-gray-500">
                    {i % 2 === 0 ? label : ''}
                  </div>
                ))}
              </div>
              {/* Grid */}
              {calendarWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px] flex-1">
                  {week.map((day) => {
                    const isFuture = day.date > today;
                    return (
                      <div
                        key={day.dateStr}
                        className={`aspect-square rounded-sm ${isFuture ? 'bg-transparent' : getActivityColor(day.count)}`}
                        title={isFuture ? '' : `${day.dateStr}: ${day.count} quete${day.count > 1 ? 's' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 justify-end">
              <span>Moins</span>
              <div className="w-3 h-3 rounded-sm bg-white/5" />
              <div className="w-3 h-3 rounded-sm bg-purple-500/30" />
              <div className="w-3 h-3 rounded-sm bg-purple-500/50" />
              <div className="w-3 h-3 rounded-sm bg-purple-500/80" />
              <span>Plus</span>
            </div>
          </div>

          {/* Section 3: Goal/theme progression */}
          {player.goals.length > 0 && (
            <div>
              <h4 className="font-bold mb-3">Progression des objectifs</h4>
              <div className="space-y-4">
                {player.goals.map((goal) => (
                  <div key={goal.id} className="bg-black/20 rounded-xl p-4">
                    <p className="font-semibold mb-3">{goal.label}</p>
                    <div className="space-y-2">
                      {goal.themes.map((theme) => {
                        const percent = developmentLevelPercent[theme.developmentLevel] || 0;
                        return (
                          <div key={theme.id}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-gray-300 truncate flex-1">{theme.name}</span>
                              <span className="text-xs text-gray-500 ml-2 shrink-0">
                                {developmentLevelLabel[theme.developmentLevel] || theme.developmentLevel} ({theme.questsCompleted})
                              </span>
                            </div>
                            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 rounded-full"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: This week */}
          <div>
            <h4 className="font-bold mb-3">Cette semaine</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-2xl font-bold">{weekStats.thisWeek}</p>
                <p className="text-xs text-gray-400">Quetes cette semaine</p>
                {weekStats.lastWeek > 0 && (
                  <p className={`text-xs mt-1 ${weekDiff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {weekDiff >= 0 ? '+' : ''}{weekDiff}% vs semaine derniere
                  </p>
                )}
              </div>
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-2xl font-bold">{avgPerDay}</p>
                <p className="text-xs text-gray-400">Moyenne par jour</p>
              </div>
            </div>
          </div>

          {/* Section 5: Category distribution */}
          {history.length > 0 && (
            <div>
              <h4 className="font-bold mb-3">Répartition par catégorie</h4>
              <div className="space-y-2">
                {(Object.keys(categoryStats) as CategoryType[]).map(cat => {
                  const Icon = categoryIcons[cat];
                  const count = categoryStats[cat];
                  const pct = maxCategoryStat > 0 ? (count / maxCategoryStat) * 100 : 0;
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <Icon size={14} className="text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-400 w-24 shrink-0">{categoryLabels[cat]}</span>
                      <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                        <div className={`h-full ${categoryColors[cat]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
