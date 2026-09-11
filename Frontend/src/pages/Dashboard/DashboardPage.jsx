import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import progressService from '../../services/progressService';
import toast from 'react-hot-toast';
import {
  FileText,
  BookOpen,
  BrainCircuit,
  TrendingUp,
  Clock,
  ArrowUpRight
} from 'lucide-react';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        console.log("Data__getDashboardData", data);

        setDashboardData(data.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-sky-100 mb-4 shadow-sm">
            <TrendingUp className="w-8 h-8 text-sky-400" />
          </div>

          <p className="text-slate-600 text-sm">
            No dashboard data available.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Documents',
      value: dashboardData.overview.totalDocuments,
      description: 'Learning materials',
      icon: FileText,
      gradient: 'from-sky-300 to-blue-400',
      shadowColor: 'shadow-blue-400/20'
    },
    {
      label: 'Total Flashcards',
      value: dashboardData.overview.totalFlashcards,
      description: 'Cards to review',
      icon: BookOpen,
      gradient: 'from-indigo-300 to-sky-400',
      shadowColor: 'shadow-indigo-400/20'
    },
    {
      label: 'Total Quizzes',
      value: dashboardData.overview.totalQuizzes,
      description: 'Practice quizzes',
      icon: BrainCircuit,
      gradient: 'from-blue-300 to-cyan-400',
      shadowColor: 'shadow-cyan-400/20'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/80 via-white to-blue-50/70 pointer-events-none" />

      <div className="absolute inset-0 bg-[radial-gradient(#bae6fd_1px,transparent_1px)] bg-size-[20px_20px] opacity-15 pointer-events-none" />

      {/* Soft decorative blobs */}
      <div className="absolute -top-32 -right-32 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 -left-40 w-80 h-80 bg-blue-200/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">

          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-sky-400 to-blue-500" />

            <span className="text-xs font-semibold text-sky-600 uppercase tracking-[0.18em]">
              Learning Overview
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            Dashboard
          </h1>

          <p className="mt-2 text-slate-500 text-sm md:text-base">
            Track your learning progress and recent activity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">

          {stats.map((stat, index) => (
            <div
              key={index}
              className="
                group relative overflow-hidden
                bg-white/65
                backdrop-blur-xl
                border border-white/80
                rounded-2xl
                p-6
                shadow-lg shadow-blue-100/50
                hover:bg-white/80
                hover:border-sky-200/70
                hover:shadow-xl hover:shadow-blue-200/40
                hover:-translate-y-1
                transition-all duration-300
              "
            >

              {/* Glass highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-sky-100/20 pointer-events-none" />

              <div className="relative">

                {/* Top row */}
                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-4xl font-semibold text-slate-900 tracking-tight">
                        {stat.value}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`
                      w-12 h-12
                      rounded-xl
                      bg-gradient-to-br ${stat.gradient}
                      shadow-lg ${stat.shadowColor}
                      flex items-center justify-center
                      group-hover:scale-110
                      group-hover:rotate-2
                      transition-all duration-300
                    `}
                  >
                    <stat.icon
                      className="w-5 h-5 text-white"
                      strokeWidth={2}
                    />
                  </div>

                </div>

                {/* Bottom accent */}
                <div className="mt-6 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full w-1/3 rounded-full bg-gradient-to-r ${stat.gradient} opacity-70`}
                  />
                </div>

              </div>
            </div>
          ))}

        </div>

        {/* Recent Activity */}
        <div
          className="
            relative overflow-hidden
            bg-white/65
            backdrop-blur-xl
            border border-white/80
            rounded-2xl
            shadow-lg shadow-blue-100/50
            p-6 md:p-8
          "
        >

          {/* Glass highlight */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-sky-100/20 pointer-events-none" />

          <div className="relative">

            {/* Section Header */}
            <div className="flex items-center justify-between mb-7">

              <div className="flex items-center gap-3">

                <div
                  className="
                    w-11 h-11
                    rounded-xl
                    bg-gradient-to-br from-sky-100 to-blue-100
                    border border-sky-200/60
                    flex items-center justify-center
                    shadow-sm
                  "
                >
                  <Clock
                    className="w-5 h-5 text-sky-500"
                    strokeWidth={2}
                  />
                </div>

                <div>
                  <h3 className="text-lg md:text-xl font-semibold text-slate-900">
                    Recent Activity
                  </h3>

                  <p className="text-xs text-slate-400 mt-0.5">
                    Your latest learning activity
                  </p>
                </div>

              </div>

            </div>

            {dashboardData.recentActivity &&
            (
              dashboardData.recentActivity.documents.length > 0 ||
              dashboardData.recentActivity.quizzes.length > 0
            ) ? (

              <div className="space-y-3">

                {[
                  ...(dashboardData.recentActivity.documents || []).map(doc => ({
                    id: doc._id,
                    description: doc.title,
                    timestamp: doc.lastAccessed,
                    link: `/documents/${doc._id}`,
                    type: 'document'
                  })),

                  ...(dashboardData.recentActivity.quizzes || []).map(quiz => ({
                    id: quiz._id,
                    description: quiz.title,
                    timestamp: quiz.lastAttempted,
                    link: `/quizzes/${quiz._id}`,
                    type: 'quiz'
                  }))
                ]

                  .sort(
                    (a, b) =>
                      new Date(b.timestamp) - new Date(a.timestamp)
                  )

                  .map((activity, index) => (

                    <div
                      key={activity.id || index}
                      className="
                        group
                        relative
                        flex items-center gap-4
                        p-4
                        rounded-xl
                        bg-white/45
                        border border-slate-200/50
                        hover:bg-white/75
                        hover:border-sky-200/70
                        hover:shadow-md hover:shadow-blue-100/40
                        transition-all duration-200
                      "
                    >

                      {/* Timeline indicator */}
                      <div className="relative shrink-0">

                        <div
                          className={`
                            w-10 h-10
                            rounded-xl
                            flex items-center justify-center
                            ${
                              activity.type === 'document'
                                ? 'bg-sky-50 border border-sky-100'
                                : 'bg-blue-50 border border-blue-100'
                            }
                          `}
                        >
                          {activity.type === 'document' ? (
                            <FileText
                              className="w-4 h-4 text-sky-500"
                              strokeWidth={2}
                            />
                          ) : (
                            <BrainCircuit
                              className="w-4 h-4 text-blue-500"
                              strokeWidth={2}
                            />
                          )}
                        </div>

                        {index <
                          dashboardData.recentActivity.documents.length +
                            dashboardData.recentActivity.quizzes.length -
                            1 && (
                          <div className="absolute left-1/2 top-10 w-px h-3 bg-sky-100" />
                        )}

                      </div>

                      {/* Activity information */}
                      <div className="flex-1 min-w-0">

                        <p className="text-sm font-medium text-slate-900 truncate">

                          {activity.type === 'document'
                            ? 'Accessed Document'
                            : 'Attempted Quiz'}

                        </p>

                        <p className="text-sm text-slate-600 truncate mt-0.5">
                          {activity.description}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>

                      </div>

                      {/* View button */}
                      {activity.link && (
                        <Link
                          to={activity.link}
                          className="
                            shrink-0
                            inline-flex items-center gap-1.5
                            px-3 py-2
                            text-xs font-semibold
                            text-sky-600
                            bg-sky-50/70
                            hover:bg-sky-100
                            hover:text-blue-600
                            rounded-lg
                            transition-all duration-200
                          "
                        >
                          View
                          <ArrowUpRight
                            className="w-3.5 h-3.5"
                            strokeWidth={2}
                          />
                        </Link>
                      )}

                    </div>

                  ))}

              </div>

            ) : (

              <div className="text-center py-14">

                <div
                  className="
                    inline-flex items-center justify-center
                    w-16 h-16
                    rounded-2xl
                    bg-gradient-to-br from-sky-50 to-blue-50
                    border border-sky-100
                    mb-4
                    shadow-sm
                  "
                >
                  <Clock className="w-8 h-8 text-sky-300" />
                </div>

                <p className="text-sm font-medium text-slate-700">
                  No recent activity yet.
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Start learning to see your progress here
                </p>

              </div>

            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;