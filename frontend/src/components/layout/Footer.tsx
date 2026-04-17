import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminCredentials, setAdminCredentials] = useState({ email: '', password: '' });
  const { adminLogin, isLoading } = useAuthStore();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminLogin(adminCredentials);
      toast.success('התחברת כמנהל בהצלחה!');
      setShowAdminModal(false);
      setAdminCredentials({ email: '', password: '' });
      // Redirect to admin dashboard
      window.location.href = '/admin';
    } catch (error) {
      toast.error('שגיאה בהתחברות כמנהל. אנא בדוק את הפרטים.');
    }
  };

  return (
    <footer className="bg-secondary-800 text-secondary-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-bold text-primary-400">
              אנשי שלומנו
            </Link>
            <p className="mt-4 text-sm">
              הפלטפורמה המובילה לחיבור בין בעלי מקצוע ללקוחות בקהילה החרדית
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">קישורים מהירים</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search" className="text-sm hover:text-primary-400 transition-colors">
                  חיפוש בעלי מקצוע
                </Link>
              </li>
              <li>
                <Link to="/pro/register" className="text-sm hover:text-primary-400 transition-colors">
                  הצטרף כבעל מקצוע
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-sm hover:text-primary-400 transition-colors">
                  הרשמה כלקוח
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">קטגוריות פופולריות</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/search/electrician" className="text-sm hover:text-primary-400 transition-colors">
                  חשמלאי
                </Link>
              </li>
              <li>
                <Link to="/search/plumber" className="text-sm hover:text-primary-400 transition-colors">
                  אינסטלטור
                </Link>
              </li>
              <li>
                <Link to="/search/ac" className="text-sm hover:text-primary-400 transition-colors">
                  מזגנים
                </Link>
              </li>
              <li>
                <Link to="/search/painter" className="text-sm hover:text-primary-400 transition-colors">
                  צבעי
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">צור קשר</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary-400" />
                <span dir="ltr">03-1234567</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>support@ansheishlomenu.co.il</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>ישראל</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-secondary-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {currentYear} אנשי שלומנו. כל הזכויות שמורות.
          </p>
          <div className="flex gap-6 items-center">
            <Link to="/terms" className="text-sm hover:text-primary-400 transition-colors">
              תנאי שימוש
            </Link>
            <Link to="/privacy" className="text-sm hover:text-primary-400 transition-colors">
              מדיניות פרטיות
            </Link>
            <Link to="/accessibility" className="text-sm hover:text-primary-400 transition-colors">
              נגישות
            </Link>
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-sm hover:text-primary-400 transition-colors flex items-center gap-1"
              title="כניסת מנהל"
            >
              <Shield className="w-4 h-4" />
              מנהל
            </button>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                כניסת מנהל
              </h3>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-secondary-400 hover:text-secondary-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  אימייל
                </label>
                <input
                  type="email"
                  value={adminCredentials.email}
                  onChange={(e) => setAdminCredentials(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="admin@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  סיסמה
                </label>
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="הזן סיסמה"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="flex-1 px-4 py-2 text-secondary-700 bg-secondary-100 rounded-md hover:bg-secondary-200 transition-colors"
                >
                  ביטול
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'מתחבר...' : 'התחבר'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
