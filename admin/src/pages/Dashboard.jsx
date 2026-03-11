import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Home,
  Activity,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  AlertCircle,
  Loader,
  Clock,
  BarChart3,
  PieChart,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Handshake,
} from "lucide-react";
import { backendurl } from "../config/constants";
import { DashboardShimmer } from "../components/ShimmerLoading";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    pendingAppointments: 0,
    recentActivity: [],
    viewsData: {},
    propertyTypeData: {},
    monthlyStats: {},
    loading: true,
    error: null,
  });

  const [timeRange, setTimeRange] = useState('30'); // 7, 30, 90 days
  const [refreshing, setRefreshing] = useState(false);

  // Enhanced chart options with modern styling
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
          drawBorder: false,
        },
        border: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3
      },
      point: {
        radius: 0,
        hoverRadius: 6,
        borderWidth: 2,
        backgroundColor: '#fff'
      }
    }
  };

  // Property type distribution chart options
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        padding: 12,
      }
    },
    cutout: '60%',
  };

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const response = await axios.get(`${backendurl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setStats((prev) => ({
          ...prev,
          ...response.data.stats,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch stats");
      }
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch dashboard data",
      }));
      console.error("Error fetching stats:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Total Properties",
      value: stats.totalProperties,
      icon: Home,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      description: "Total properties listed",
      change: "+12%",
      changeType: "positive"
    },
    {
      title: "Active Listings",
      value: stats.activeListings,
      icon: Activity,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      description: "Currently active listings",
      change: "+8%",
      changeType: "positive"
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      description: "Property page views",
      change: "+23%",
      changeType: "positive"
    },
    {
      title: "Pending Appointments",
      value: stats.pendingAppointments,
      icon: Calendar,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      description: "Awaiting confirmation",
      change: "-5%",
      changeType: "negative"
    },
  ];

  if (stats.loading) {
    return <DashboardShimmer />;
  }

  if (stats.error) {
    return (
      <div className="flex items-center justify-center py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center glass-card p-8 max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-6">{stats.error}</p>
          <button onClick={fetchStats} disabled={refreshing} className="glass-btn flex items-center gap-2 mx-auto disabled:opacity-50">
            {refreshing ? <Loader className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {refreshing ? 'Retrying...' : 'Try Again'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Welcome back! Here&apos;s your property overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center glass-card p-1" style={{ borderRadius: '14px' }}>
            {['7', '30', '90'].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days)}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  timeRange === days
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
          <button
            onClick={fetchStats}
            disabled={refreshing}
            className="p-2.5 glass-card hover:shadow-md transition-all disabled:opacity-50"
            style={{ borderRadius: '14px' }}
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass-card gradient-border p-6 group hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.changeType === 'positive' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2 glass-card p-6"
        >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Property Views Analytics
                </h2>
                <p className="text-sm text-gray-600 mt-1">Track your property engagement over time</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Views
                </div>
              </div>
            </div>
            <div className="h-[350px]">
              {stats.viewsData && Object.keys(stats.viewsData).length > 0 ? (
                <Line data={stats.viewsData} options={chartOptions} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No view data available</p>
                  <p className="text-sm text-gray-400">Data will appear once you have property views</p>
                </div>
              )}
            </div>
          </motion.div>

        {/* Property Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-600" />
                Property Types
              </h2>
              <p className="text-sm text-gray-500 mt-1">Distribution overview</p>
            </div>
          </div>
          <div className="h-[300px]">
            {stats.propertyTypeData && Object.keys(stats.propertyTypeData).length > 0 ? (
              <Doughnut data={stats.propertyTypeData} options={doughnutOptions} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                  <PieChart className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium text-sm">No property data</p>
                <p className="text-xs text-gray-400 text-center">Add properties to see distribution</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Recent Activity
            </h2>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {stats.recentActivity?.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 hover:bg-blue-50/30 rounded-xl transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{activity.description}</p>
                    <p className="text-xs text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10">
                <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Performance Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Performance Insights
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50/60">
              <div>
                <p className="text-sm text-gray-500">Avg. Views per Property</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProperties > 0 ? Math.round(stats.totalViews / stats.totalProperties) : 0}
                </p>
              </div>
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-green-50/60">
              <div>
                <p className="text-sm text-gray-500">Active Listing Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProperties > 0 ? Math.round((stats.activeListings / stats.totalProperties) * 100) : 0}%
                </p>
              </div>
              <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50/60">
              <div>
                <p className="text-sm text-gray-500">Pending Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
              </div>
              <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;