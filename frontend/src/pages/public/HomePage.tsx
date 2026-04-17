import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Shield, Phone, Users, CheckCircle } from 'lucide-react';
import { Button } from '../../components/common';
import { professionalService } from '../../services/professional.service';
import { mockService } from '../../services/mock.service';
// import { MyButton } from "@library-example/my-button";

export default function HomePage() {
  const features = [
    {
      icon: <Shield className='w-8 h-8' />,
      title: 'התאמה לפי מגדר',
      description: 'אפשרות לבחור נותני שירות מתאימים לנורמות צניעות.',
    },
    {
      icon: <Phone className='w-8 h-8' />,
      title: 'משיבון סלולרי',
      description: 'גישה מלאה גם ללא גלישה לאינטרנט.',
    },
    {
      icon: <Star className='w-8 h-8' />,
      title: 'דירוגים וביקורות',
      description: 'השוואת מחירים ודירוגים שמשפיעים על ההמלצות.',
    },
    {
      icon: <CheckCircle className='w-8 h-8' />,
      title: 'אמינות מאומתת',
      description: 'מערכת ביקורת חכמה ותגובות מאומתות.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'חיפוש',
      description: 'מצאו בעל מקצוע לפי קטגוריה, מיקום או תיאור הבעיה',
    },
    {
      number: '2',
      title: 'השוואה',
      description: 'השוו מחירים, דירוגים ובחרו את המתאים ביותר',
    },
    {
      number: '3',
      title: 'יצירת קשר',
      description: 'בקשו הצעת מחיר או צרו קשר ישיר עם בעל המקצוע',
    },
    {
      number: '4',
      title: 'דירוג',
      description: 'לאחר השירות, דרגו ועזרו לאחרים לבחור נכון',
    },
  ];

  const [stats, setStats] = useState([
    { value: '0', label: 'בעלי מקצוע' },
    { value: '0', label: 'לקוחות מרוצים' },
    { value: '0', label: 'ביקורות' },
    { value: '0', label: 'דירוג ממוצע' },
  ]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [professionalsResult, customers] = await Promise.all([
          professionalService.search({}),
          mockService.getCustomers(),
        ]);

        const professionals = professionalsResult.professionals;
        const totalProfessionals = professionals.length;
        const totalCustomers = customers.length;
        const totalReviews = professionals.reduce((sum, prof) => sum + (prof.reviewCount || 0), 0);
        const averageRating = professionals.length
          ? professionals.reduce((sum, prof) => sum + (prof.rating?.overall || 0), 0) / professionals.length
          : 0;

        setStats([
          { value: `${totalProfessionals}`, label: 'בעלי מקצוע' },
          { value: `${totalCustomers}`, label: 'לקוחות מרוצים' },
          { value: `${totalReviews}`, label: 'ביקורות' },
          { value: `${averageRating.toFixed(1)}`, label: 'דירוג ממוצע' },
        ]);
      } catch (error) {
        console.error('Failed to load homepage stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className='bg-gradient-to-b from-primary-50 to-white py-20'>
        <div className='container mx-auto px-4 text-center'>
          <h1 className='text-4xl md:text-5xl font-bold text-secondary-800 mb-6'>
            שקיפות, אמינות ונגישות
            {/* <MyButton label="Click me" onClick={() => console.log("hi")} /> */}
            <br />
            <span className='text-primary-600'>לשירותים טכניים</span>
          </h1>
          <p className='text-xl text-secondary-600 mb-8 max-w-2xl mx-auto'>
            השוו מחירים, בדקו דירוגים ותאמו מקצוענים לפי מגדר, אמינות וכשרות —
            גם דרך משיבון סלולרי מותאם.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/search'>
              <Button size='lg'>
                <Search className='w-5 h-5' />
                מצא בעל מקצוע
              </Button>
            </Link>
            <Link to='/pro/register'>
              <Button variant='outline' size='lg'>
                <Users className='w-5 h-5' />
                הצטרף כבעל מקצוע
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className='py-12 bg-white'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            {stats.map((stat) => (
              <div key={stat.label} className='text-center'>
                <div className='text-3xl md:text-4xl font-bold text-primary-600 mb-2'>
                  {stat.value}
                </div>
                <div className='text-secondary-600'>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-secondary-50'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center text-secondary-800 mb-12'>
            מה המערכת מציעה
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {features.map((feature) => (
              <div
                key={feature.title}
                className='bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow'
              >
                <div className='text-primary-500 mb-4'>{feature.icon}</div>
                <h3 className='text-lg font-semibold text-secondary-800 mb-2'>
                  {feature.title}
                </h3>
                <p className='text-secondary-600'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center text-secondary-800 mb-12'>
            איך זה עובד
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            {steps.map((step, index) => (
              <div key={step.number} className='relative text-center'>
                <div className='w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4'>
                  {step.number}
                </div>
                <h3 className='text-lg font-semibold text-secondary-800 mb-2'>
                  {step.title}
                </h3>
                <p className='text-secondary-600'>{step.description}</p>
                {index < steps.length - 1 && (
                  <div className='hidden md:block absolute top-8 left-0 w-full h-0.5 bg-primary-200 -z-10 transform -translate-x-1/2' />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-primary-600'>
        <div className='container mx-auto px-4 text-center'>
          <h2 className='text-3xl font-bold text-white mb-6'>מוכנים להתחיל?</h2>
          <p className='text-xl text-primary-100 mb-8 max-w-2xl mx-auto'>
            הצטרפו לאלפי לקוחות ובעלי מקצוע שכבר נהנים משירות אמין ושקוף
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link to='/search'>
              <Button
                variant='secondary'
                size='lg'
                className='bg-white text-primary-600 hover:bg-primary-50'
              >
                חפש בעל מקצוע
              </Button>
            </Link>
            <a href='tel:*1234'>
              <Button
                variant='outline'
                size='lg'
                className='border-white text-white hover:bg-primary-700'
              >
                <Phone className='w-5 h-5' />
                חייג *1234
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className='py-20 bg-white'>
        <div className='container mx-auto px-4'>
          <h2 className='text-3xl font-bold text-center text-secondary-800 mb-4'>
            קטגוריות פופולריות
          </h2>
          <p className='text-center text-secondary-600 mb-12'>
            מצאו בעלי מקצוע בתחומים השונים
          </p>
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {[
              'חשמלאי',
              'אינסטלטור',
              'טכנאי מחשבים',
              'מיזוג אוויר',
              'שרברב',
              'מנעולן',
              'צבעי',
              'נגר',
              'גנן',
              'מוביל',
              'מכונאי',
              'עוד...',
            ].map((category) => (
              <Link
                key={category}
                to={`/search?category=${category}`}
                className='bg-secondary-50 hover:bg-primary-50 hover:text-primary-600 rounded-lg p-4 text-center text-secondary-700 transition-colors'
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
