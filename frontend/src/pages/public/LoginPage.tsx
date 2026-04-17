import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button, Input, Card } from '../../components/common';
import { useAuthStore } from '../../store/authStore';
import { loginSchema, LoginFormData } from '../../utils/validators';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading } = useAuthStore();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
      toast.success('התחברת בהצלחה!');
      navigate(from, { replace: true });
    } catch {
      toast.error('שגיאה בהתחברות. אנא בדוק את הפרטים ונסה שוב.');
    }
  };

  return (
    <div className='min-h-screen bg-secondary-50 flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-md'>
        {/* Logo/Title */}
        <div className='text-center mb-8'>
          <Link to='/' className='inline-block'>
            <h1 className='text-3xl font-bold text-primary-600'>אנשי שלומנו</h1>
          </Link>
          <p className='mt-2 text-secondary-600'>ברוכים הבאים חזרה</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-semibold text-secondary-800'>
                התחברות
              </h2>
            </div>

            <Input
              label='אימייל'
              type='email'
              placeholder='example@email.com'
              error={errors.email?.message}
              {...register('email')}
            />

            <div className='relative'>
              <Input
                label='סיסמה'
                type={showPassword ? 'text' : 'password'}
                placeholder='הזן סיסמה'
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute left-3 top-[42px] text-secondary-400 hover:text-secondary-600'
              >
                {showPassword ? (
                  <EyeOff className='w-5 h-5' />
                ) : (
                  <Eye className='w-5 h-5' />
                )}
              </button>
            </div>

            <div className='flex items-center justify-between text-sm'>
              <Link
                to='/forgot-password'
                className='text-primary-600 hover:text-primary-700'
              >
                שכחתי סיסמה
              </Link>
            </div>

            <Button type='submit' fullWidth isLoading={isLoading}>
              <LogIn className='w-5 h-5' />
              התחברות
            </Button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-secondary-600'>
              אין לך חשבון?{' '}
              <Link
                to='/register'
                className='text-primary-600 hover:text-primary-700 font-medium'
              >
                הרשמה
              </Link>
            </p>
          </div>

          <div className='mt-4 text-center'>
            <Link
              to='/pro/register'
              className='text-sm text-secondary-500 hover:text-secondary-700'
            >
              הרשמה כבעל מקצוע
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
