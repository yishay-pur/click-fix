import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Calendar,
  FileText,
  MessageSquare,
  ChevronLeft,
} from 'lucide-react';
import {
  Button,
  Avatar,
  RatingStars,
  ReviewCard,
  Card,
  PageLoader,
} from '../../components/common';
import { RATING_LABELS, DAYS_OF_WEEK } from '../../utils/constants';
import { classNames } from '../../utils/helpers';
import { professionalService } from '../../services/professional.service';
import type { Professional } from '../../types/professional.types';
import type { Review } from '../../types/review.types';

export default function ProfessionalProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'services'>('overview');
  const [professional, setProfessional] = useState<Professional | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const proData = await professionalService.getById(id);
        setProfessional(proData);

        // Map reviews from the employee include
        const proAny = proData as any;
        if (proAny.reviews) {
          const mappedReviews: Review[] = proAny.reviews.map((r: any) => ({
            id: String(r.id),
            professionalId: String(r.employee_id),
            customerId: String(r.user_id),
            customerName: r.user ? `${r.user.firstName || ''} ${r.user.lastName || ''}`.trim() : 'לקוח',
            ratings: {
              reliability: r.rating || 0,
              service: r.rating || 0,
              availability: r.rating || 0,
              price: r.rating || 0,
              professionalism: r.rating || 0,
            },
            overallRating: r.rating || 0,
            content: r.content || '',
            createdAt: new Date(r.createdAt),
            isVerified: true,
          }));
          setReviews(mappedReviews);
        }
      } catch (error) {
        console.error('Failed to fetch professional:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!professional) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-secondary-800 mb-4">בעל מקצוע לא נמצא</h1>
        <Link to="/search">
          <Button>חזרה לחיפוש</Button>
        </Link>
      </div>
    );
  }

  const proAny = professional as any;
  const rating = professional.rating || { overall: 0, reliability: 0, service: 0, availability: 0, price: 0, professionalism: 0 };
  const reviewCount = professional.reviewCount || reviews.length || 0;
  const serviceAreas = professional.serviceAreas || (proAny.area ? [proAny.area] : []);
  const workingHours = professional.workingHours || proAny.workingHours || [];
  const services = professional.services || proAny.services || [];
  const certificates = professional.certificates || proAny.certificates || [];
  const categoryName = professional.categoryName || (proAny.categories?.[0]?.name) || '';

  const ratingCategories = Object.entries(rating).filter(
    ([key]) => key !== 'overall'
  ) as [keyof typeof RATING_LABELS, number][];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="container mx-auto px-4 py-6">
          <Link
            to="/search"
            className="inline-flex items-center gap-1 text-secondary-600 hover:text-primary-600 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            חזרה לתוצאות החיפוש
          </Link>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile image and basic info */}
            <div className="flex items-start gap-4">
              <Avatar
                src={professional.profileImage}
                name={`${professional.firstName} ${professional.lastName}`}
                size="xl"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-secondary-800">
                    {professional.firstName} {professional.lastName}
                  </h1>
                  {professional.isVerified && (
                    <CheckCircle className="w-6 h-6 text-success" />
                  )}
                </div>
                <p className="text-lg text-secondary-600 mb-2">{categoryName}</p>
                <RatingStars
                  rating={rating.overall}
                  reviewCount={reviewCount}
                  size="md"
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex-1 flex flex-wrap gap-4 md:justify-end items-start">
              {professional.yearsOfExperience && (
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-secondary-500" />
                  <span className="text-secondary-700">
                    {professional.yearsOfExperience} שנות ניסיון
                  </span>
                </div>
              )}
              {serviceAreas.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-secondary-500" />
                  <span className="text-secondary-700">
                    {serviceAreas.slice(0, 2).join(', ')}
                    {serviceAreas.length > 2 && ` +${serviceAreas.length - 2}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            <Link to={`/professional/${id}/quote`}>
              <Button size="lg">
                <MessageSquare className="w-5 h-5" />
                בקש הצעת מחיר
              </Button>
            </Link>
            {professional.phone && (
              <a href={`tel:${professional.phone}`}>
                <Button variant="outline" size="lg">
                  <Phone className="w-5 h-5" />
                  התקשר עכשיו
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-secondary-200 sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            {[
              { key: 'overview', label: 'סקירה כללית' },
              { key: 'services', label: 'שירותים ומחירים' },
              { key: 'reviews', label: `ביקורות (${reviewCount})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={classNames(
                  'py-4 border-b-2 font-medium transition-colors',
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* About */}
                <Card>
                  <h2 className="text-lg font-semibold text-secondary-800 mb-4">אודות</h2>
                  <p className="text-secondary-700 leading-relaxed">{professional.description || 'אין תיאור'}</p>
                </Card>

                {/* Rating breakdown */}
                {rating.overall > 0 && (
                  <Card>
                    <h2 className="text-lg font-semibold text-secondary-800 mb-4">פירוט דירוגים</h2>
                    <div className="space-y-3">
                      {ratingCategories.map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-secondary-600">{RATING_LABELS[key]}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 h-2 bg-secondary-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary-500 rounded-full"
                                style={{ width: `${(value / 5) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-secondary-700 w-8">
                              {value.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recent reviews */}
                {reviews.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-secondary-800">ביקורות אחרונות</h2>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className="text-primary-600 hover:text-primary-700 text-sm"
                      >
                        צפה בכל הביקורות
                      </button>
                    </div>
                    <div className="space-y-4">
                      {reviews.slice(0, 2).map((review) => (
                        <ReviewCard key={review.id} review={review} showDetailedRating />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'services' && (
              <Card>
                <h2 className="text-lg font-semibold text-secondary-800 mb-4">שירותים ומחירים</h2>
                {services.length > 0 ? (
                  <div className="divide-y divide-secondary-100">
                    {services.map((service: any, idx: number) => {
                      const isString = typeof service === 'string';
                      const name = isString ? service : service.name;
                      const minPrice = isString ? null : service.minPrice;
                      const maxPrice = isString ? null : service.maxPrice;
                      const hasPrice = typeof minPrice === 'number' && typeof maxPrice === 'number';
                      return (
                        <div key={service.id || idx} className="py-4 flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-secondary-800">{name}</h3>
                            {!isString && service.description && (
                              <p className="text-sm text-secondary-500 mt-1">{service.description}</p>
                            )}
                          </div>
                          {hasPrice && (
                            <div className="text-left">
                              <span className="font-semibold text-primary-600">
                                {minPrice === maxPrice
                                  ? `${minPrice} ש"ח`
                                  : `${minPrice} - ${maxPrice} ש"ח`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-secondary-500">אין שירותים להצגה</p>
                )}
              </Card>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-secondary-800">
                    כל הביקורות ({reviewCount})
                  </h2>
                </div>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} showDetailedRating />
                  ))
                ) : (
                  <Card className="text-center py-8">
                    <p className="text-secondary-500">אין ביקורות עדיין</p>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact info */}
            <Card>
              <h2 className="text-lg font-semibold text-secondary-800 mb-4">פרטי קשר</h2>
              <div className="space-y-3">
                {professional.phone && (
                  <a
                    href={`tel:${professional.phone}`}
                    className="flex items-center gap-3 text-secondary-700 hover:text-primary-600"
                  >
                    <Phone className="w-5 h-5" />
                    {professional.phone}
                  </a>
                )}
                {professional.email && (
                  <a
                    href={`mailto:${professional.email}`}
                    className="flex items-center gap-3 text-secondary-700 hover:text-primary-600"
                  >
                    <Mail className="w-5 h-5" />
                    {professional.email}
                  </a>
                )}
              </div>
            </Card>

            {/* Working hours */}
            {workingHours.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-secondary-800 mb-4">
                  <Clock className="w-5 h-5 inline ml-2" />
                  שעות פעילות
                </h2>
                <div className="space-y-2">
                  {workingHours.map((wh: any) => {
                    const dayLabel = DAYS_OF_WEEK.find((d) => d.value === wh.day)?.label;
                    return (
                      <div key={wh.day} className="flex justify-between text-sm">
                        <span className="text-secondary-600">{dayLabel}</span>
                        <span className={wh.isWorking ? 'text-secondary-800' : 'text-secondary-400'}>
                          {wh.isWorking ? `${wh.startTime} - ${wh.endTime}` : 'סגור'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Service areas */}
            {serviceAreas.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-secondary-800 mb-4">
                  <MapPin className="w-5 h-5 inline ml-2" />
                  אזורי שירות
                </h2>
                <div className="flex flex-wrap gap-2">
                  {serviceAreas.map((area: string) => (
                    <span
                      key={area}
                      className="px-3 py-1 bg-secondary-100 rounded-full text-sm text-secondary-700"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* Certificates */}
            {certificates.length > 0 && (
              <Card>
                <h2 className="text-lg font-semibold text-secondary-800 mb-4">
                  <FileText className="w-5 h-5 inline ml-2" />
                  תעודות והסמכות
                </h2>
                <div className="space-y-2">
                  {certificates.map((cert: any, idx: number) => (
                    <a
                      key={cert.id || idx}
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-secondary-700 hover:text-primary-600"
                    >
                      <FileText className="w-4 h-4" />
                      {cert.name}
                    </a>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
