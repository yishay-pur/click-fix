import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Briefcase,
  FileText,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button, Card, Input, Select, Checkbox } from '../../components/common';
import { professionalRegisterSchema, type ProfessionalRegisterFormData } from '../../utils/validators';
import { ISRAELI_CITIES, DAYS_OF_WEEK, CATEGORIES } from '../../utils/constants';
import { classNames } from '../../utils/helpers';
import type { WorkingHours, ServicePrice } from '../../types/professional.types';
import { authService } from '../../services/auth.service';
import { toast } from 'react-toastify';

type Step = 1 | 2 | 3 | 4 | 5;

const steps = [
  { number: 1, title: 'פרטים אישיים', icon: User },
  { number: 2, title: 'פרטי המקצוע', icon: Briefcase },
  { number: 3, title: 'תעודות והסמכות', icon: FileText },
  { number: 4, title: 'שעות ומחירים', icon: Clock },
  { number: 5, title: 'אישור והרשמה', icon: CheckCircle },
];

const defaultWorkingHours: WorkingHours[] = DAYS_OF_WEEK.map((day) => ({
  day: day.value as WorkingHours['day'],
  isWorking: day.value !== 'saturday',
  startTime: '08:00',
  endTime: '17:00',
}));

export default function ProfessionalRegisterPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificates, setCertificates] = useState<Array<{ name: string; file: File | null }>>([]);
  const [services, setServices] = useState<Array<Omit<ServicePrice, 'id'>>>([
    { name: '', minPrice: 0, maxPrice: 0 },
  ]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ProfessionalRegisterFormData>({
    resolver: zodResolver(professionalRegisterSchema),
    defaultValues: {
      workingHours: defaultWorkingHours,
      serviceAreas: [],
      acceptTerms: false,
    },
  });

  const categoryOptions = CATEGORIES.map((c) => ({ value: c.id, label: c.name }));

  const validateStep = async (step: Step): Promise<boolean> => {
    switch (step) {
      case 1:
        return await trigger(['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword']);
      case 2:
        return await trigger(['categoryId', 'serviceAreas']);
      case 3:
        return true; // Certificates are optional
      case 4:
        return true; // Services and working hours are managed via local state
      case 5:
        return await trigger(['acceptTerms']);
      default:
        return true;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const addCertificate = () => {
    setCertificates([...certificates, { name: '', file: null }]);
  };

  const removeCertificate = (index: number) => {
    setCertificates(certificates.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, field: 'name' | 'file', value: string | File) => {
    const updated = [...certificates];
    if (field === 'name') {
      updated[index].name = value as string;
    } else {
      updated[index].file = value as File;
    }
    setCertificates(updated);
  };

  const addService = () => {
    setServices([...services, { name: '', minPrice: 0, maxPrice: 0 }]);
  };

  const removeService = (index: number) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index: number, field: keyof Omit<ServicePrice, 'id'>, value: string | number) => {
    const updated = [...services];
    if (field === 'name') {
      updated[index].name = value as string;
    } else if (field === 'minPrice') {
      updated[index].minPrice = Number(value);
    } else if (field === 'maxPrice') {
      updated[index].maxPrice = Number(value);
    }
    setServices(updated);
  };

  const onSubmit = async (data: ProfessionalRegisterFormData) => {
    setIsSubmitting(true);
    try {
      await authService.registerProfessional({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        categoryId: data.categoryId,
        yearsOfExperience: data.yearsOfExperience,
        description: data.description,
        serviceAreas: data.serviceAreas,
        workingHours: data.workingHours,
        services: services.filter((s) => s.name),
      });
      toast.success('ההרשמה בוצעה בהצלחה! אנא התחבר עם הפרטים שלך');
      navigate('/login', { state: { registered: true, professional: true } });
    } catch (error: any) {
      const message = error.response?.data?.message || 'שגיאה בהרשמה, נסה שוב';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            אנשי שלומנו
          </Link>
          <h1 className="text-2xl font-bold text-secondary-800 mt-4">
            הרשמה כבעל מקצוע
          </h1>
          <p className="text-secondary-600 mt-2">
            הצטרפו לקהילת בעלי המקצוע שלנו
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={classNames(
                    'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors',
                    currentStep >= step.number
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-200 text-secondary-500'
                  )}
                >
                  {currentStep > step.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={classNames(
                      'h-1 w-12 sm:w-20 mx-2',
                      currentStep > step.number ? 'bg-primary-500' : 'bg-secondary-200'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <span
                key={step.number}
                className={classNames(
                  'text-xs sm:text-sm',
                  currentStep >= step.number ? 'text-primary-600' : 'text-secondary-400'
                )}
              >
                {step.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit, (formErrors) => {
          console.log('Form validation errors:', formErrors);
          const errorMessages = Object.entries(formErrors)
            .map(([field, err]) => `${field}: ${err?.message || 'שגיאה'}`)
            .join('\n');
          toast.error(`יש שגיאות בטופס:\n${errorMessages}`);
        })}>
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-6">פרטים אישיים</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="שם פרטי"
                    required
                    {...register('firstName')}
                    error={errors.firstName?.message}
                  />
                  <Input
                    label="שם משפחה"
                    required
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
                <Input
                  label="אימייל"
                  type="email"
                  dir="ltr"
                  required
                  {...register('email')}
                  error={errors.email?.message}
                />
                <Input
                  label="טלפון"
                  type="tel"
                  dir="ltr"
                  placeholder="0501234567"
                  required
                  {...register('phone')}
                  error={errors.phone?.message}
                />
                <Input
                  label="סיסמה"
                  type="password"
                  required
                  helperText="לפחות 8 תווים, אות גדולה באנגלית ומספר"
                  {...register('password')}
                  error={errors.password?.message}
                />
                <Input
                  label="אימות סיסמה"
                  type="password"
                  required
                  {...register('confirmPassword')}
                  error={errors.confirmPassword?.message}
                />
              </div>
            </Card>
          )}

          {/* Step 2: Professional Details */}
          {currentStep === 2 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-6">פרטי המקצוע</h2>
              <div className="space-y-4">
                <Select
                  label="תחום התמחות"
                  required
                  options={categoryOptions}
                  placeholder="בחר תחום"
                  {...register('categoryId')}
                  error={errors.categoryId?.message}
                />
                <Input
                  label="שנות ניסיון"
                  type="number"
                  min={0}
                  {...register('yearsOfExperience', { valueAsNumber: true })}
                  error={errors.yearsOfExperience?.message}
                />
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    תיאור קצר
                  </label>
                  <textarea
                    rows={3}
                    placeholder="ספרו על עצמכם ועל השירותים שאתם מציעים..."
                    className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-500/20 resize-none"
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-error">{errors.description.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    אזורי שירות <span className="text-error">*</span>
                  </label>
                  <Controller
                    name="serviceAreas"
                    control={control}
                    render={({ field }) => (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-secondary-200 rounded-lg">
                        {ISRAELI_CITIES.map((city) => (
                          <label
                            key={city}
                            className="flex items-center gap-2 cursor-pointer hover:bg-secondary-50 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={field.value?.includes(city)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...(field.value || []), city]);
                                } else {
                                  field.onChange(field.value?.filter((c: string) => c !== city));
                                }
                              }}
                              className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm text-secondary-700">{city}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  {errors.serviceAreas && (
                    <p className="mt-1 text-sm text-error">{errors.serviceAreas.message}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Step 3: Certificates */}
          {currentStep === 3 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-2">תעודות והסמכות</h2>
              <p className="text-secondary-600 text-sm mb-6">
                העלו תעודות מקצועיות, רישיונות או הסמכות רלוונטיות (אופציונלי)
              </p>
              <div className="space-y-4">
                {certificates.map((cert, index) => (
                  <div key={index} className="flex gap-4 items-start p-4 bg-secondary-50 rounded-lg">
                    <div className="flex-1 space-y-3">
                      <Input
                        label="שם התעודה"
                        placeholder="לדוגמה: תעודת חשמלאי מוסמך"
                        value={cert.name}
                        onChange={(e) => updateCertificate(index, 'name', e.target.value)}
                      />
                      <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">
                          קובץ
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              updateCertificate(index, 'file', e.target.files[0]);
                            }
                          }}
                          className="block w-full text-sm text-secondary-500 file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                        />
                        {cert.file && (
                          <p className="text-sm text-green-600 mt-1">
                            <CheckCircle className="w-4 h-4 inline ml-1" />
                            {cert.file.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertificate(index)}
                      className="p-2 text-secondary-400 hover:text-error transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addCertificate}>
                  <Plus className="w-5 h-5" />
                  הוסף תעודה
                </Button>
              </div>
            </Card>
          )}

          {/* Step 4: Working Hours & Services */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <h2 className="text-lg font-semibold text-secondary-800 mb-6">שעות פעילות</h2>
                <div className="space-y-3">
                  <Controller
                    name="workingHours"
                    control={control}
                    render={({ field }) => (
                      <>
                        {DAYS_OF_WEEK.map((day, index) => {
                          const wh = field.value?.[index];
                          return (
                            <div
                              key={day.value}
                              className="flex items-center gap-4 p-3 bg-secondary-50 rounded-lg"
                            >
                              <label className="flex items-center gap-2 w-24">
                                <input
                                  type="checkbox"
                                  checked={wh?.isWorking}
                                  onChange={(e) => {
                                    const updated = [...(field.value || [])];
                                    updated[index] = { ...updated[index], isWorking: e.target.checked };
                                    field.onChange(updated);
                                  }}
                                  className="w-4 h-4 rounded border-secondary-300 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-secondary-700">
                                  {day.label}
                                </span>
                              </label>
                              {wh?.isWorking && (
                                <div className="flex items-center gap-2 flex-1">
                                  <input
                                    type="time"
                                    value={wh.startTime || '08:00'}
                                    onChange={(e) => {
                                      const updated = [...(field.value || [])];
                                      updated[index] = { ...updated[index], startTime: e.target.value };
                                      field.onChange(updated);
                                    }}
                                    className="px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                  />
                                  <span className="text-secondary-500">עד</span>
                                  <input
                                    type="time"
                                    value={wh.endTime || '17:00'}
                                    onChange={(e) => {
                                      const updated = [...(field.value || [])];
                                      updated[index] = { ...updated[index], endTime: e.target.value };
                                      field.onChange(updated);
                                    }}
                                    className="px-3 py-2 border border-secondary-300 rounded-lg text-sm"
                                  />
                                </div>
                              )}
                              {!wh?.isWorking && (
                                <span className="text-sm text-secondary-400">סגור</span>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  />
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-secondary-800 mb-6">שירותים ומחירים</h2>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex gap-4 items-end p-4 bg-secondary-50 rounded-lg">
                      <div className="flex-1">
                        <Input
                          label="שם השירות"
                          placeholder="לדוגמה: תיקון תקלות חשמל"
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          label="מחיר מינימום"
                          type="number"
                          min={0}
                          value={service.minPrice || ''}
                          onChange={(e) => updateService(index, 'minPrice', e.target.value)}
                        />
                      </div>
                      <div className="w-28">
                        <Input
                          label="מחיר מקסימום"
                          type="number"
                          min={0}
                          value={service.maxPrice || ''}
                          onChange={(e) => updateService(index, 'maxPrice', e.target.value)}
                        />
                      </div>
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="p-2 text-secondary-400 hover:text-error transition-colors mb-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addService}>
                    <Plus className="w-5 h-5" />
                    הוסף שירות
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Step 5: Terms & Submit */}
          {currentStep === 5 && (
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-6">אישור והרשמה</h2>
              <div className="space-y-6">
                {/* Summary */}
                <div className="p-4 bg-secondary-50 rounded-lg">
                  <h3 className="font-medium text-secondary-800 mb-3">סיכום הפרטים</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-secondary-500">שם:</span>
                    <span className="text-secondary-800">{watch('firstName')} {watch('lastName')}</span>
                    <span className="text-secondary-500">אימייל:</span>
                    <span className="text-secondary-800">{watch('email')}</span>
                    <span className="text-secondary-500">טלפון:</span>
                    <span className="text-secondary-800">{watch('phone')}</span>
                    <span className="text-secondary-500">תחום:</span>
                    <span className="text-secondary-800">
                      {categoryOptions.find((c) => c.value === watch('categoryId'))?.label}
                    </span>
                    <span className="text-secondary-500">אזורי שירות:</span>
                    <span className="text-secondary-800">
                      {watch('serviceAreas')?.slice(0, 3).join(', ')}
                      {(watch('serviceAreas')?.length || 0) > 3 && ` +${(watch('serviceAreas')?.length || 0) - 3}`}
                    </span>
                    <span className="text-secondary-500">שירותים:</span>
                    <span className="text-secondary-800">{services.filter((s) => s.name).length} שירותים</span>
                  </div>
                </div>

                {/* Terms */}
                <div className="p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-medium text-secondary-800 mb-3">תנאי שימוש</h3>
                  <div className="text-sm text-secondary-600 mb-4 max-h-32 overflow-y-auto">
                    <p>בהרשמה לשירות אני מאשר/ת:</p>
                    <ul className="list-disc mr-5 mt-2 space-y-1">
                      <li>שכל הפרטים שמסרתי נכונים ומדויקים</li>
                      <li>שאני בעל/ת הסמכה מתאימה לעבוד בתחום שבחרתי</li>
                      <li>שקראתי והסכמתי לתנאי השימוש ומדיניות הפרטיות</li>
                      <li>שאני מסכים/ה לקבל הודעות על בקשות חדשות</li>
                    </ul>
                  </div>
                  <Controller
                    name="acceptTerms"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        label={
                          <span>
                            קראתי ואני מסכים/ה ל
                            <Link to="/terms" className="text-primary-600 hover:underline">
                              תנאי השימוש
                            </Link>
                            {' '}ול
                            <Link to="/privacy" className="text-primary-600 hover:underline">
                              מדיניות הפרטיות
                            </Link>
                          </span>
                        }
                        checked={field.value}
                        onChange={field.onChange}
                        error={errors.acceptTerms?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronRight className="w-5 h-5" />
              הקודם
            </Button>
            {currentStep < 5 ? (
              <Button type="button" onClick={nextStep}>
                הבא
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting}>
                <CheckCircle className="w-5 h-5" />
                שלח בקשת הרשמה
              </Button>
            )}
          </div>
        </form>

        {/* Login Link */}
        <p className="text-center mt-6 text-secondary-600">
          כבר יש לך חשבון?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            התחבר
          </Link>
        </p>
      </div>
    </div>
  );
}
