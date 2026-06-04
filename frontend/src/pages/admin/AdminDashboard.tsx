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
  Trash2,
  Plus,
  X,
} from "lucide-react";
import { Card, PageLoader } from "../../components/common";
import { classNames } from "../../utils/helpers";
import { adminService, type Manager } from "../../services/admin.service";
import type { RecentActivity } from "../../services/admin.service";
import { useAuthStore } from "../../store/authStore";
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

interface ProfessionData {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStat[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const [categories, setCategories] = useState<any[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [otherAdmins, setOtherAdmins] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [isCreatingManager, setIsCreatingManager] = useState(false);
  const [newManagerForm, setNewManagerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Color palette for professions
  const professionColors = [
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f59e0b", // amber
    "#06b6d4", // cyan
    "#8b5cf6", // purple
    "#f87171", // red
    "#4ade80", // green
  ];

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

    // Calculate profession distribution
    const totalProfessionalsInCategories = categories.reduce(
      (sum, cat) => sum + (cat.professionalsCount || 0),
      0
    );

    const professionData: ProfessionData[] = categories
      .filter((cat) => (cat.professionalsCount || 0) > 0)
      .map((cat, index) => ({
        name: cat.name,
        count: cat.professionalsCount || 0,
        percentage: Math.round(
          ((cat.professionalsCount || 0) /
            Math.max(totalProfessionalsInCategories, 1)) *
            100
        ),
        color: professionColors[index % professionColors.length],
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalUsers,
      totalProfessionals,
      pendingApprovals,
      reviewsToCheck,
      openComplaints,
      quotesThisMonth,
      professionData,
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

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newManagerForm.firstName || !newManagerForm.lastName || !newManagerForm.email || !newManagerForm.password) {
      toast.error('אנא מלא את כל השדות');
      return;
    }

    setIsCreatingManager(true);
    try {
      await adminService.createManager(newManagerForm);
      toast.success('מנהל חדש נוצר בהצלחה');
      setNewManagerForm({ firstName: '', lastName: '', email: '', password: '' });
      setShowAddManagerModal(false);
      
      // Refresh managers list
      if (user?.isAdmin) {
        const managersData = await adminService.getAllManagers();
        const admins = managersData.filter((m) => m.isAdmin);
        const regularManagers = managersData.filter((m) => !m.isAdmin);
        setOtherAdmins(admins.filter((a) => a.id !== user?.id));
        setManagers(regularManagers);
      }
    } catch (error) {
      console.error('Error creating manager:', error);
      toast.error('שגיאה בהוספת מנהל');
    } finally {
      setIsCreatingManager(false);
    }
  };

  const handleDeleteManager = async (id: string) => {
    if (!window.confirm('האם בטוח שברצונך למחוק מנהל זה?')) {
      return;
    }

    try {
      await adminService.deleteManager(id);
      toast.success('מנהל נמחק בהצלחה');
      
      // Refresh managers list
      if (user?.isAdmin) {
        const managersData = await adminService.getAllManagers();
        const admins = managersData.filter((m) => m.isAdmin);
        const regularManagers = managersData.filter((m) => !m.isAdmin);
        setOtherAdmins(admins.filter((a) => a.id !== user?.id));
        setManagers(regularManagers);
      }
    } catch (error) {
      console.error('Error deleting manager:', error);
      toast.error('שגיאה במחיקת מנהל');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats, activity, and categories in parallel
        const [statsData, activityData, categoriesData] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentActivity(),
          adminService.getCategories(),
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
        setCategories(categoriesData);

        // If user is admin, fetch managers
        if (user?.isAdmin) {
          try {
            const managersData = await adminService.getAllManagers();
            // Separate admins and managers
            const admins = managersData.filter((m) => m.isAdmin);
            const regularManagers = managersData.filter((m) => !m.isAdmin);
            setOtherAdmins(admins.filter((a) => a.id !== user?.id));
            setManagers(regularManagers);
          } catch (error) {
            console.error("Failed to fetch managers:", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("שגיאה בטעינת נתוני הדשבורד");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Chart 5: Employees by Profession */}
        {chartData.professionData && chartData.professionData.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-secondary-800 mb-6">
              בעלי מקצוע לפי מקצוע
            </h2>
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                {chartData.professionData.slice(0, 4).map((profession) => {
                  return (
                    <div key={profession.name} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: profession.color }}
                      />
                      <span className="text-xs text-secondary-600 flex-1">
                        {profession.name}: {profession.count} ({profession.percentage}%)
                      </span>
                    </div>
                  );
                })}
                {chartData.professionData.length > 4 && (
                  <div className="text-xs text-secondary-500 pt-2">
                    ועוד {chartData.professionData.length - 4} קטגוריות
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-secondary-100">
                <div className="text-sm font-semibold text-secondary-700">
                  סה"כ בעלי מקצוע:{" "}
                  {chartData.professionData.reduce((sum, p) => sum + p.count, 0)}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Admin Panel - Managers & Admins Management */}
      {user?.isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Managers List */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-secondary-800">
                מנהלים
              </h2>
              <button
                onClick={() => setShowAddManagerModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                הוסף מנהל
              </button>
            </div>
            {managers.length === 0 ? (
              <p className="text-secondary-500">אין מנהלים כרגע</p>
            ) : (
              <div className="space-y-2">
                {managers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-secondary-800">
                        {manager.firstName} {manager.lastName}
                      </p>
                      {manager.email && (
                        <p className="text-sm text-secondary-500">{manager.email}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteManager(manager.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="מחק מנהל"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Other Admins List */}
          {otherAdmins.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-6">
                מנהלים אחרים
              </h2>
              <div className="space-y-2">
                {otherAdmins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-secondary-800">
                        {admin.firstName} {admin.lastName}
                      </p>
                      {admin.email && (
                        <p className="text-sm text-secondary-500">{admin.email}</p>
                      )}
                    </div>
                    <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                      מנהל
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add Manager Modal */}
      {showAddManagerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-secondary-800">
                הוסף מנהל חדש
              </h3>
              <button
                onClick={() => setShowAddManagerModal(false)}
                className="p-1 hover:bg-secondary-100 rounded"
              >
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>

            <form onSubmit={handleCreateManager} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  שם פרטי
                </label>
                <input
                  type="text"
                  value={newManagerForm.firstName}
                  onChange={(e) =>
                    setNewManagerForm({
                      ...newManagerForm,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="שם פרטי"
                  disabled={isCreatingManager}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  שם משפחה
                </label>
                <input
                  type="text"
                  value={newManagerForm.lastName}
                  onChange={(e) =>
                    setNewManagerForm({
                      ...newManagerForm,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="שם משפחה"
                  disabled={isCreatingManager}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  דוא"ל
                </label>
                <input
                  type="email"
                  value={newManagerForm.email}
                  onChange={(e) =>
                    setNewManagerForm({
                      ...newManagerForm,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="example@email.com"
                  disabled={isCreatingManager}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  סיסמה
                </label>
                <input
                  type="password"
                  value={newManagerForm.password}
                  onChange={(e) =>
                    setNewManagerForm({
                      ...newManagerForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="סיסמה"
                  disabled={isCreatingManager}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isCreatingManager}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-400 transition-colors font-medium"
                >
                  {isCreatingManager ? "מוסיף..." : "הוסף מנהל"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddManagerModal(false)}
                  disabled={isCreatingManager}
                  className="flex-1 px-4 py-2 bg-secondary-200 text-secondary-800 rounded-lg hover:bg-secondary-300 disabled:bg-gray-300 transition-colors font-medium"
                >
                  ביטול
                </button>
              </div>
            </form>
          </Card>
        </div>
      )}

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
