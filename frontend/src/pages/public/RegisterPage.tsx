import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button, Input, Card, AddressAutocomplete } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { registerSchema, RegisterFormData } from '../../utils/validators';
import { searchCities, searchStreets } from '../../api/address.api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      city: '',
      street: '',
      houseNumber: '',
    },
  });

  const selectedCity = watch('city');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      toast.success('נרשמת בהצלחה!');
      navigate('/');
    } catch {
      toast.error('שגיאה בהרשמה. אנא בדוק את הפרטים ונסה שוב.');
    }
  };

  return (
    <div className='min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-lg'>
        <div className='text-center mb-8'>
          <Link to='/' className='inline-block'>
            <h1 className='text-3xl font-bold text-primary-600'>אנשי שלומנו</h1>
          </Link>
          <p className='mt-2 text-secondary-600'>הצטרפו אלינו</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-semibold text-secondary-800'>הרשמה</h2>
            </div>

            {/* Name */}
            <div className='grid grid-cols-2 gap-4'>
              <Input
                label='שם פרטי'
                placeholder='ישראל'
                required
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label='שם משפחה'
                placeholder='ישראלי'
                required
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            {/* Email */}
            <Input
              label='אימייל'
              type='email'
              placeholder='example@email.com'
              required
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password */}
            <div className='relative'>
              <Input
                label='סיסמה'
                type={showPassword ? 'text' : 'password'}
                placeholder='לפחות 8 תווים, אות גדולה ומספר'
                required
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute left-3 top-[42px] text-secondary-400 hover:text-secondary-600'
              >
                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </div>

            <div className='relative'>
              <Input
                label='אישור סיסמה'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='הזן שוב את הסיסמה'
                required
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute left-3 top-[42px] text-secondary-400 hover:text-secondary-600'
              >
                {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
              </button>
            </div>

            {/* Address section */}
            <div className='pt-1'>
              <p className='text-sm font-medium text-secondary-600 mb-3'>כתובת (אופציונלי)</p>

              {/* City + Street */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4'>
                <Controller
                  name='city'
                  control={control}
                  render={({ field }) => (
                    <AddressAutocomplete
                      label='עיר'
                      placeholder='התחל להקליד עיר...'
                      value={field.value || ''}
                      onChange={field.onChange}
                      fetchSuggestions={searchCities}
                      error={errors.city?.message}
                      name='city'
                    />
                  )}
                />
                <Controller
                  name='street'
                  control={control}
                  render={({ field }) => (
                    <AddressAutocomplete
                      label='רחוב'
                      placeholder={selectedCity ? 'התחל להקליד רחוב...' : 'בחר עיר תחילה'}
                      value={field.value || ''}
                      onChange={field.onChange}
                      fetchSuggestions={(q) => searchStreets(selectedCity || '', q)}
                      disabled={!selectedCity}
                      error={errors.street?.message}
                      name='street'
                    />
                  )}
                />
              </div>

              {/* House number */}
              <Input
                label='מספר בית'
                placeholder='25'
                error={errors.houseNumber?.message}
                {...register('houseNumber')}
              />
            </div>

            <Button type='submit' fullWidth isLoading={isLoading}>
              <UserPlus className='w-5 h-5' />
              הרשמה
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-secondary-600'>
              כבר יש לך חשבון?{' '}
              <Link to='/login' className='text-primary-600 hover:text-primary-700 font-medium'>
                התחברות
              </Link>
            </p>
          </div>

          <div className='mt-4 text-center' style={{ opacity: '0.5' }}>
            הרשמה כבעל מקצוע (בקרוב)
          </div>
        </Card>
      </div>
    </div>
  );
}
