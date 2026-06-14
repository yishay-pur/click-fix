import { Link } from 'react-router-dom';
import { MapPin, CheckCircle, Clock } from 'lucide-react';
import { classNames } from '../../utils/helpers';
import { Avatar } from './Avatar';
import { RatingStars } from './RatingStars';
import { Button } from './Button';
import type { Professional } from '../../types/professional.types';

interface ProfessionalCardProps {
  professional: Professional;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function ProfessionalCard({
  professional,
  variant = 'default',
  className,
}: ProfessionalCardProps) {
  const {
    id,
    firstName,
    lastName,
    profileImage,
    categoryName,
    rating,
    reviewCount,
    serviceAreas,
    isVerified,
    yearsOfExperience,
    services,
  } = professional;

  const fullName = `${firstName} ${lastName}`;
  const prices = services?.map((s) => s.minPrice).filter((p): p is number => typeof p === 'number' && p > 0) ?? [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;

  if (variant === 'compact') {
    return (
      <Link
        to={`/professional/${id}`}
        className={classNames(
          'flex items-center gap-4 p-4 bg-white rounded-lg border border-secondary-200',
          'hover:border-primary-300 hover:shadow-sm transition-all',
          className,
        )}
      >
        <Avatar src={profileImage} name={fullName} size='lg' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2'>
            <h3 className='font-medium text-secondary-800 truncate'>
              {fullName}
            </h3>
            {isVerified && (
              <CheckCircle className='w-4 h-4 text-success flex-shrink-0' />
            )}
          </div>
          <p className='text-sm text-secondary-500'>{categoryName}</p>
          <RatingStars
            rating={rating.overall}
            size='sm'
            reviewCount={reviewCount}
          />
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <div
        className={classNames(
          'bg-white rounded-xl border border-primary-200 shadow-md overflow-hidden',
          className,
        )}
      >
        <div className='bg-gradient-to-l from-primary-500 to-primary-600 p-4 text-white'>
          <span className='text-sm font-medium'>בעל מקצוע מומלץ</span>
        </div>
        <div className='p-6'>
          <div className='flex items-start gap-4'>
            <Avatar src={profileImage} name={fullName} size='xl' />
            <div className='flex-1'>
              <div className='flex items-center gap-2 mb-1'>
                <h3 className='text-xl font-semibold text-secondary-800'>
                  {fullName}
                </h3>
                {isVerified && <CheckCircle className='w-5 h-5 text-success' />}
              </div>
              <p className='text-secondary-600 mb-2'>{categoryName}</p>
              <RatingStars rating={rating.overall} reviewCount={reviewCount} />
            </div>
          </div>
          <div className='mt-4 pt-4 border-t border-secondary-100'>
            <div className='flex flex-wrap gap-4 text-sm text-secondary-600 mb-4'>
              {serviceAreas?.slice(0, 3).map((area) => (
                <span key={area} className='flex items-center gap-1'>
                  <MapPin className='w-4 h-4' />
                  {area}
                </span>
              ))}
              {yearsOfExperience && (
                <span className='flex items-center gap-1'>
                  <Clock className='w-4 h-4' />
                  {yearsOfExperience} שנות ניסיון
                </span>
              )}
            </div>
            <Link to={`/professional/${id}`}>
              <Button fullWidth>צפה בפרופיל</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={classNames(
        'bg-white rounded-xl border border-secondary-200 p-5 hover:shadow-md transition-shadow',
        className,
      )}
    >
      <div className='flex items-start gap-4'>
        <Avatar src={profileImage} name={fullName} size='lg' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h3 className='font-semibold text-secondary-800 truncate'>
              {fullName}
            </h3>
            {isVerified && (
              <CheckCircle className='w-4 h-4 text-success flex-shrink-0' />
            )}
          </div>
          <p className='text-sm text-secondary-500 mb-2'>{categoryName}</p>
          <RatingStars
            rating={rating?.overall}
            size='sm'
            reviewCount={reviewCount}
          />
        </div>
        {minPrice && (
          <div className='text-left'>
            <span className='text-xs text-secondary-500'>החל מ-</span>
            <div className='text-lg font-semibold text-primary-600'>
              {minPrice.toLocaleString('he-IL')} ש"ח
            </div>
          </div>
        )}
      </div>

      <div className='mt-4 flex flex-wrap gap-2'>
        {serviceAreas?.slice(0, 3).map((area) => (
          <span
            key={area}
            className='inline-flex items-center gap-1 px-2 py-1 bg-secondary-100 rounded-full text-xs text-secondary-600'
          >
            <MapPin className='w-3 h-3' />
            {area}
          </span>
        ))}
        {serviceAreas?.length > 3 && (
          <span className='px-2 py-1 bg-secondary-100 rounded-full text-xs text-secondary-600'>
            +{serviceAreas?.length - 3}
          </span>
        )}
      </div>

      <div className='mt-4 pt-4 border-t border-secondary-100 flex gap-3'>
        <Link to={`/professional/${id}`} className='flex-1'>
          <Button variant='outline' fullWidth size='sm'>
            צפה בפרופיל
          </Button>
        </Link>
        <Link to={`/professional/${id}/quote`} className='flex-1'>
          <Button fullWidth size='sm'>
            בקש הצעת מחיר
          </Button>
        </Link>
      </div>
    </div>
  );
}
