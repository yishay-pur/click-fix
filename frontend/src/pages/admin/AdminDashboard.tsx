import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserCheck,
  Briefcase,
  Star,
  AlertTriangle,
  TrendingUp,
  FileText,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { Card, PageLoader } from "../../components/common";
import { classNames } from "../../utils/helpers";
import { adminService } from "../../services/admin.service";
import type { RecentActivity } from "../../services/admin.service";
import { toast } from "react-toastify";

interface DashboardStat {
  label: string;
  value: number;
  change?: number;
  icon: React.ElementType;
  color: string;
  href: string;
}

const activityColors: Record<RecentActivity["type"], string> = {
  registration: "bg-blue-100 text-blue-600",
  review: "bg-yellow-100 text-yellow-600",
  complaint: "bg-red-100 text-red-600",
  approval: "bg-green-100 text-green-600",
};

const activityIcons: Record<RecentActivity["type"], React.ElementType> = {
  registration: UserCheck,
  review: Star,
  complaint: AlertTriangle,
  approval: Briefcase,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to create pie chart percentages
  const getPieChartData = () => {
    const totalUsers =
      stats.find((s) => s.label === "משתמשים רשומים")?.value || 0;
    const totalProfessionals =
      stats.find((s) => s.label === "בעלי מקצוע")?.value || 0;
    const pendingApprovals =
      stats.find((s) => s.label === "ממתינים לאישור")?.value || 0;
    const reviewsToCheck =
      stats.find((s) => s.label === "ביקורות להתייחסות")?.value || 0;
    const openComplaints =
      stats.find((s) => s.label === "תלונות פתוחות")?.value || 0;
    const quotesThisMonth =
      stats.find((s) => s.label === "הצעות מחיר החודש")?.value || 0;

    return {
      totalUsers,
      totalProfessionals,
      pendingApprovals,
      reviewsToCheck,
      openComplaints,
      quotesThisMonth,
      usersPercent: Math.round(
        (totalUsers / Math.max(totalUsers + totalProfessionals, 1)) * 100
      ),
      pendingPercent: Math.round(
        (pendingApprovals / Math.max(totalProfessionals, 1)) * 100
      ),
      pendingItemsTotal: pendingApprovals + reviewsToCheck + openComplaints,
      pendingApprovalPercent: Math.round(
        (pendingApprovals /
          Math.max(pendingApprovals + reviewsToCheck + openComplaints, 1)) *
          100
      ),
      reviewsPercent: Math.round(
        (reviewsToCheck /
          Math.max(pendingApprovals + reviewsToCheck + openComplaints, 1)) *
          100
      ),
      complaintsPercent: Math.round(
        (openComplaints /
          Math.max(pendingApprovals + reviewsToCheck + openComplaints, 1)) *
          100
      ),
      quotesPercent: Math.round(
        (quotesThisMonth / Math.max(totalProfessionals, 1)) * 100
      ),
    };
  };

  const chartData = getPieChartData();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats and activity in parallel
        const [statsData, activityData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentActivity(),
        ]);

        // Transform stats data to match UI format
        const transformedStats: DashboardStat[] = [
          {
            label: "משתמשים רשומים",
            value: statsData.totalUsers,
            change: statsData.growth.users,
            icon: Users,
            color: "bg-blue-100 text-blue-600",
            href: "/admin/users",
          },
          {
            label: "בעלי מקצוע",
            value: statsData.totalProfessionals,
            change: statsData.growth.professionals,
            icon: Briefcase,
            color: "bg-green-100 text-green-600",
            href: "/admin/professionals",
          },
          {
            label: "ממתינים לאישור",
            value: statsData.pendingApprovals,
            icon: UserCheck,
            color: "bg-yellow-100 text-yellow-600",
            href: "/admin/approvals",
          },
          {
            label: "ביקורות להתייחסות",
            value: statsData.reviewsToCheck,
            icon: Star,
            color: "bg-purple-100 text-purple-600",
            href: "/admin/reviews",
          },
          {
            label: "תלונות פתוחות",
            value: statsData.openComplaints,
            icon: AlertTriangle,
            color: "bg-red-100 text-red-600",
            href: "/admin/complaints",
          },
          {
            label: "הצעות מחיר החודש",
            value: statsData.quotesThisMonth,
            change: statsData.growth.quotes,
            icon: FileText,
            color: "bg-indigo-100 text-indigo-600",
            href: "/admin",
          },
        ];

        setStats(transformedStats);
        setRecentActivities(activityData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("שגיאה בטעינת נתוני הדשבורד");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">
          <Settings className="w-7 h-7 inline ml-2 text-primary-500" />
          פאנל ניהול
        </h1>
        <p className="text-secondary-600">סקירה כללית של המערכת</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={classNames("p-3 rounded-lg", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-secondary-500">{stat.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-secondary-800">
                      {stat.value.toLocaleString()}
                    </span>
                    {stat.change && (
                      <span className="flex items-center text-sm text-green-600">
                        <TrendingUp className="w-4 h-4 ml-1" />+{stat.change}%
                      </span>
                    )}
                  </div>
                </div>
                <ChevronLeft className="w-5 h-5 text-secondary-400" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Chart 1: Users vs Professionals */}
        <Card>
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">
            התפלגות משתמשים
          </h2>
          <div className="flex gap-8">
            <div className="flex-shrink-0 relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="30"
                  strokeDasharray={`${
                    (chartData.usersPercent * 314) / 100
                  } 314`}
                  transform="rotate(-90 60 60)"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="30"
                  strokeDasharray={`${
                    ((100 - chartData.usersPercent) * 314) / 100
                  } 314`}
                  strokeDashoffset={`-${(chartData.usersPercent * 314) / 100}`}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="65"
                  textAnchor="middle"
                  className="text-lg font-bold fill-secondary-800"
                >
                  {chartData.totalUsers}
                </text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-secondary-600">
                  משתמשים: {chartData.totalUsers} ({chartData.usersPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-secondary-600">
                  בעלי מקצוע: {chartData.totalProfessionals} (
                  {100 - chartData.usersPercent}%)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Chart 2: Pending Approvals */}
        <Card>
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">
            מצב אישורים
          </h2>
          <div className="flex gap-8">
            <div className="flex-shrink-0 relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="30"
                  strokeDasharray={`${
                    (chartData.pendingPercent * 314) / 100
                  } 314`}
                  transform="rotate(-90 60 60)"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#d1d5db"
                  strokeWidth="30"
                  strokeDasharray={`${
                    ((100 - chartData.pendingPercent) * 314) / 100
                  } 314`}
                  strokeDashoffset={`-${
                    (chartData.pendingPercent * 314) / 100
                  }`}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="65"
                  textAnchor="middle"
                  className="text-lg font-bold fill-secondary-800"
                >
                  {chartData.pendingApprovals}
                </text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-sm text-secondary-600">
                  ממתינים: {chartData.pendingApprovals} (
                  {chartData.pendingPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <span className="text-sm text-secondary-600">
                  אושרו:{" "}
                  {chartData.totalProfessionals - chartData.pendingApprovals} (
                  {100 - chartData.pendingPercent}%)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Chart 3: Pending Items */}
        <Card>
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">
            פריטים הממתינים לטיפול
          </h2>
          <div className="flex gap-8">
            <div className="flex-shrink-0 relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray={`${
                    (chartData.pendingApprovalPercent * 314) / 100
                  } 314`}
                  transform="rotate(-90 60 60)"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="20"
                  strokeDasharray={`${
                    (chartData.reviewsPercent * 314) / 100
                  } 314`}
                  strokeDashoffset={`-${
                    (chartData.pendingApprovalPercent * 314) / 100
                  }`}
                  transform="rotate(-90 60 60)"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${
                    (chartData.complaintsPercent * 314) / 100
                  } 314`}
                  strokeDashoffset={`-${
                    ((chartData.pendingApprovalPercent +
                      chartData.reviewsPercent) *
                      314) /
                    100
                  }`}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="65"
                  textAnchor="middle"
                  className="text-sm font-bold fill-secondary-800"
                >
                  {chartData.pendingItemsTotal}
                </text>
              </svg>
            </div>
            <div className="flex-1 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-secondary-600">
                  אישורים: {chartData.pendingApprovals} (
                  {chartData.pendingApprovalPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-secondary-600">
                  ביקורות: {chartData.reviewsToCheck} (
                  {chartData.reviewsPercent}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-secondary-600">
                  תלונות: {chartData.openComplaints} (
                  {chartData.complaintsPercent}%)
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Chart 4: Quotes This Month */}
        <Card>
          <h2 className="text-lg font-semibold text-secondary-800 mb-6">
            הצעות מחיר
          </h2>
          <div className="flex gap-8">
            <div className="flex-shrink-0 relative w-32 h-32">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="30"
                  strokeDasharray={`${
                    (chartData.quotesPercent * 314) / 100
                  } 314`}
                  transform="rotate(-90 60 60)"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="30"
                  strokeDasharray={`${
                    ((100 - chartData.quotesPercent) * 314) / 100
                  } 314`}
                  strokeDashoffset={`-${(chartData.quotesPercent * 314) / 100}`}
                  transform="rotate(-90 60 60)"
                />
                <text
                  x="60"
                  y="65"
                  textAnchor="middle"
                  className="text-lg font-bold fill-secondary-800"
                >
                  {chartData.quotesThisMonth}
                </text>
              </svg>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm text-secondary-600">
                  החודש: {chartData.quotesThisMonth} ({chartData.quotesPercent}
                  %)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <span className="text-sm text-secondary-600">
                  ממוצע לבעל מקצוע
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-secondary-100">
                <span className="text-xs text-green-600 font-semibold">
                  +
                  {stats.find((s) => s.label === "הצעות מחיר החודש")?.change ||
                    0}
                  % צמיחה
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-secondary-800 mb-4">
            פעולות מהירות
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/approvals"
              className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <UserCheck className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-medium text-secondary-800">
                  אישור בעלי מקצוע
                </div>
                <div className="text-sm text-secondary-500">
                  {stats.find((s) => s.label === "ממתינים לאישור")?.value || 0}{" "}
                  ממתינים
                </div>
              </div>
            </Link>
            <Link
              to="/admin/reviews"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-secondary-800">ביקורות</div>
                <div className="text-sm text-secondary-500">
                  {stats.find((s) => s.label === "ביקורות להתייחסות")?.value ||
                    0}{" "}
                  לבדיקה
                </div>
              </div>
            </Link>
            <Link
              to="/admin/complaints"
              className="flex items-center gap-3 p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            >
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="font-medium text-secondary-800">תלונות</div>
                <div className="text-sm text-secondary-500">
                  {stats.find((s) => s.label === "תלונות פתוחות")?.value || 0}{" "}
                  פתוחות
                </div>
              </div>
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-secondary-800">קטגוריות</div>
                <div className="text-sm text-secondary-500">ניהול</div>
              </div>
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-secondary-800 mb-4">
            פעילות אחרונה
          </h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = activityIcons[activity.type];
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-secondary-50 rounded-lg"
                >
                  <div
                    className={classNames(
                      "p-2 rounded-lg",
                      activityColors[activity.type]
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-800">
                      {activity.title}
                    </p>
                    <p className="text-sm text-secondary-500">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-secondary-400 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
