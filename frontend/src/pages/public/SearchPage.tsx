import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button, Select, Card, ProfessionalCard, Loader } from '../../components/common';
import { professionalService } from '../../services/professional.service';
import { categoryService } from '../../services/category.service';
import type { Professional } from '../../types/professional.types';
import type { Category } from '../../types/category.types';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [allProfessionals, setAllProfessionals] = useState<Professional[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filter states
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [shomerShabbat, setShomerShabbat] = useState(searchParams.get('shomerShabbat') === 'true');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'relevance');

  const cityOptions = Array.from(
    new Set(allProfessionals.map((p) => p.city).filter(Boolean))
  )
    .sort()
    .map((city) => ({ value: city, label: city }));

  const genderOptions = Array.from(
    new Set(allProfessionals.map((p) => p.gender).filter(Boolean))
  )
    .sort()
    .map((gender) => ({ value: gender, label: gender }));

  const categoryOptions = categories.map((c) => ({ value: c.id.toString(), label: c.name }));
  const ratingOptions = [
    { value: '4', label: '4 כוכבים ומעלה' },
    { value: '3', label: '3 כוכבים ומעלה' },
    { value: '2', label: '2 כוכבים ומעלה' },
  ];

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const fullResult = await professionalService.search({});
        setAllProfessionals(fullResult.professionals);
      } catch (error) {
        console.error('Failed to load professionals for filter options:', error);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [professionalsResult, categoriesResult] = await Promise.all([
          professionalService.search({
            query: query || undefined,
            category: category || undefined,
            city: city || undefined,
            gender: gender || undefined,
            minRating: minRating ? parseInt(minRating) : undefined,
            shomerShabbat,
          }),
          categoryService.getAll()
        ]);
        setProfessionals(professionalsResult.professionals);
        setCategories(categoriesResult);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query, category, city, gender, minRating, shomerShabbat]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category) params.set('category', category);
    if (city) params.set('city', city);
    if (gender) params.set('gender', gender);
    if (minRating) params.set('minRating', minRating);
    if (shomerShabbat) params.set('shomerShabbat', 'true');
    if (sortBy && sortBy !== 'relevance') params.set('sortBy', sortBy);
    setSearchParams(params);
    // The useEffect will automatically re-fetch data when filters change
  };

  const clearFilters = () => {
    setQuery('');
    setCategory('');
    setCity('');
    setGender('');
    setMinRating('');
    setShomerShabbat(false);
    setSortBy('relevance');
    setSearchParams({});
  };

  const removeFilter = (filterKey: string) => {
    switch (filterKey) {
      case 'category':
        setCategory('');
        break;
      case 'city':
        setCity('');
        break;
      case 'gender':
        setGender('');
        break;
      case 'minRating':
        setMinRating('');
        break;
      case 'shomerShabbat':
        setShomerShabbat(false);
        break;
    }
    handleSearch();
  };

  const hasActiveFilters = category || city || gender || minRating || shomerShabbat;

  // Sort professionals (sorting is done client-side since it's UI preference)
  const sortedProfessionals = [...professionals].sort((a: Professional, b: Professional) => {
    switch (sortBy) {
      case 'rating':
        return b.rating.overall - a.rating.overall;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Search Header */}
      <div className="bg-white border-b border-secondary-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="חפש בעל מקצוע או שירות..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pr-12 pl-4 py-3 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="w-5 h-5" />
              חיפוש
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="w-5 h-5" />
              סינון
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside
            className={`${
              showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : 'hidden'
            } md:static md:block md:w-72 flex-shrink-0`}
          >
            {/* Mobile close button */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <h3 className="font-semibold text-secondary-800">סינון תוצאות</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-secondary-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <Card className="md:sticky md:top-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-secondary-800 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  סינון תוצאות
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    נקה הכל
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <Select
                  label="קטגוריה"
                  options={categoryOptions}
                  placeholder="בחר קטגוריה"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />

                <Select
                  label="עיר"
                  options={cityOptions}
                  placeholder="בחר עיר"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />

                <Select
                  label="מגדר בעל המקצוע"
                  options={genderOptions}
                  placeholder="לא משנה"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                />

                <Select
                  label="דירוג מינימלי"
                  options={ratingOptions}
                  placeholder="כל הדירוגים"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                />

                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={shomerShabbat}
                    onChange={(e) => setShomerShabbat(e.target.checked)}
                    className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  שומר שבת (אין שעות עבודה בשבת)
                </label>

              </div>
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-secondary-600">
                נמצאו{' '}
                <span className="font-semibold text-secondary-800">
                  {sortedProfessionals.length}
                </span>{' '}
                תוצאות
              </p>
              <Select
                options={[
                  { value: 'relevance', label: 'רלוונטיות' },
                  { value: 'rating', label: 'דירוג גבוה' },
                  { value: 'reviews', label: 'מספר ביקורות' },
                ]}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-44"
              />
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {category && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {categoryOptions.find((c) => c.value === category)?.label}
                    <button onClick={() => removeFilter('category')}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {city && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {city}
                    <button onClick={() => removeFilter('city')}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {gender && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {genderOptions.find((g) => g.value === gender)?.label}
                    <button onClick={() => removeFilter('gender')}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
                {minRating && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                    {ratingOptions.find((r) => r.value === minRating)?.label}
                    <button onClick={() => removeFilter('minRating')}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader size="lg" />
              </div>
            )}

            {/* Professional Cards */}
            {!isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sortedProfessionals.map((professional) => (
                  <ProfessionalCard key={professional.id} professional={professional} />
                ))}
              </div>
            )}

            {/* No Results */}
            {!isLoading && sortedProfessionals.length === 0 && (
              <Card className="text-center py-12">
                <Search className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-secondary-800 mb-2">
                  לא נמצאו תוצאות
                </h3>
                <p className="text-secondary-600 mb-4">
                  נסו לשנות את מילות החיפוש או להסיר חלק מהסינונים
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  נקה סינונים
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
