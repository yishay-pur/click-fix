import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings, User, Lock, Bell, Check } from 'lucide-react';
import { Button, Card, Input, Select } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { ISRAELI_CITIES, GENDER_OPTIONS } from '../../utils/constants';
import { classNames } from '../../utils/helpers';

const profileSchema = z.object({
  firstName: z.string().min(2, 'שם פרטי חייב להכיל לפחות 2 תווים'),
  lastName: z.string().min(2, 'שם משפחה חייב להכיל לפחות 2 תווים'),
  city: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'שדה חובה'),
  newPassword: z.string()
    .min(8, 'סיסמה חייבת להכיל לפחות 8 תווים')
    .regex(/[A-Z]/, 'סיסמה חייבת להכיל לפחות אות גדולה באנגלית')
    .regex(/[0-9]/, 'סיסמה חייבת להכיל לפחות מספר אחד'),
  confirmPassword: z.string().min(1, 'שדה חובה'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'הסיסמאות אינן תואמות',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

type SettingsTab = 'profile' | 'password' | 'notifications';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      city: user?.city || '',
      gender: user?.gender,
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setIsProfileSaving(true);
    setSuccessMessage(null);
    try {
      // In production: await authService.updateProfile(data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateUser(data);
      setSuccessMessage('הפרטים עודכנו בהצלחה');
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsProfileSaving(false);
    }
  };

  const onPasswordSubmit = async (_data: PasswordFormData) => {
    setIsPasswordSaving(true);
    setSuccessMessage(null);
    try {
      // In production: await authService.changePassword(_data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      resetPassword();
      setSuccessMessage('הסיסמה שונתה בהצלחה');
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'פרטים אישיים', icon: User },
    { id: 'password' as const, label: 'סיסמה', icon: Lock },
    { id: 'notifications' as const, label: 'התראות', icon: Bell },
  ];

  const cityOptions = ISRAELI_CITIES.map((c) => ({ value: c, label: c }));
  const genderOptions = GENDER_OPTIONS.map((g) => ({ value: g.value, label: g.label }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-800 mb-2">
          <Settings className="w-7 h-7 inline ml-2 text-primary-500" />
          הגדרות
        </h1>
        <p className="text-secondary-600">
          נהלו את הפרטים האישיים וההעדפות שלכם
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-colors',
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50'
                  )}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-6">
                פרטים אישיים
              </h2>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="שם פרטי"
                    required
                    {...registerProfile('firstName')}
                    error={profileErrors.firstName?.message}
                  />
                  <Input
                    label="שם משפחה"
                    required
                    {...registerProfile('lastName')}
                    error={profileErrors.lastName?.message}
                  />
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="עיר"
                    options={cityOptions}
                    placeholder="בחר עיר"
                    {...registerProfile('city')}
                  />
                  <Select
                    label="מגדר"
                    options={genderOptions}
                    placeholder="בחר מגדר"
                    {...registerProfile('gender')}
                  />
                </div>

                <div className="pt-4">
                  <Button type="submit" isLoading={isProfileSaving}>
                    שמור שינויים
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'password' && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-6">
                שינוי סיסמה
              </h2>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-md">
                <Input
                  label="סיסמה נוכחית"
                  type="password"
                  required
                  {...registerPassword('currentPassword')}
                  error={passwordErrors.currentPassword?.message}
                />
                <Input
                  label="סיסמה חדשה"
                  type="password"
                  required
                  helperText="לפחות 8 תווים, אות גדולה באנגלית ומספר"
                  {...registerPassword('newPassword')}
                  error={passwordErrors.newPassword?.message}
                />
                <Input
                  label="אימות סיסמה חדשה"
                  type="password"
                  required
                  {...registerPassword('confirmPassword')}
                  error={passwordErrors.confirmPassword?.message}
                />

                <div className="pt-4">
                  <Button type="submit" isLoading={isPasswordSaving}>
                    שנה סיסמה
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-6">
                הגדרות התראות
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'email', label: 'התראות באימייל', description: 'קבל עדכונים על בקשות והצעות מחיר' },
                  { id: 'sms', label: 'התראות ב-SMS', description: 'קבל הודעות טקסט על עדכונים חשובים' },
                  { id: 'marketing', label: 'עדכונים שיווקיים', description: 'קבל מידע על מבצעים ושירותים חדשים' },
                ].map((notification) => (
                  <label
                    key={notification.id}
                    className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg cursor-pointer hover:bg-secondary-100"
                  >
                    <div>
                      <div className="font-medium text-secondary-800">{notification.label}</div>
                      <div className="text-sm text-secondary-500">{notification.description}</div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={notification.id !== 'marketing'}
                      className="w-5 h-5 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                    />
                  </label>
                ))}
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
