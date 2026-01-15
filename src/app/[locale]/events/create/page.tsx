'use client';

import { useState, lazy, Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Combobox } from '@/components/ui/combobox';
import { LocationAutocomplete } from '@/components/events/LocationAutocomplete';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Loader2,
  Music,
  Palette,
  HeartPulse,
  Utensils,
  Users,
  HeartHandshake,
  LogIn,
} from 'lucide-react';
import { EVENT_CATEGORIES, EVENT_TAGS, CITIES, getCategoryById } from '@/lib/constants';
import type { CategoryId, City, CreateEventInput } from '@/types';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { createEvent } from '@/lib/actions/events';

// Dynamic import for LocationPicker (uses Leaflet which needs client-side only)
const LocationPicker = lazy(() => import('@/components/map/LocationPicker').then(mod => ({ default: mod.LocationPicker })));

// Icon mapping for categories
const categoryIcons: Record<string, React.ReactNode> = {
  'music': <Music className="h-6 w-6" />,
  'palette': <Palette className="h-6 w-6" />,
  'heart-pulse': <HeartPulse className="h-6 w-6" />,
  'utensils': <Utensils className="h-6 w-6" />,
  'users': <Users className="h-6 w-6" />,
  'hand-heart': <HeartHandshake className="h-6 w-6" />,
};

const steps = [
  { id: 1, key: 'step1' },
  { id: 2, key: 'step2' },
  { id: 3, key: 'step3' },
  { id: 4, key: 'step4' },
];

interface FormData extends Partial<CreateEventInput> {
  selectedTags: string[];
}

export default function CreateEventPage() {
  const t = useTranslations('eventForm');
  const tCategories = useTranslations('events.categories');
  const tSubcategories = useTranslations('events.subcategories');
  const tTags = useTranslations('events.tags');
  const tCities = useTranslations('cities');
  const tAuth = useTranslations('auth');
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: undefined,
    subcategory: '',
    selectedTags: [],
    location_name: '',
    location_city: undefined,
    start_date: '',
    end_date: '',
    price: '',
    contact_phone: '',
    contact_email: '',
    contact_whatsapp: '',
  });

  // Separate state for date and time inputs
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');

  // Price: free toggle + numeric value
  const [isFreeEvent, setIsFreeEvent] = useState(true);
  const [priceValue, setPriceValue] = useState('');
  const [endTime, setEndTime] = useState('');

  // Combine date and time into datetime string
  const combineDateTime = (date: string, time: string): string => {
    if (!date) return '';
    if (!time) return `${date}T00:00`;
    return `${date}T${time}`;
  };

  const updateFormData = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleTag = (tagId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tagId)
        ? prev.selectedTags.filter((t) => t !== tagId)
        : [...prev.selectedTags, tagId],
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!formData.category || !formData.subcategory) {
      setSubmitError('Catégorie requise');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    // Combine date and time
    const fullStartDate = combineDateTime(startDate, startTime);
    const fullEndDate = endDate ? combineDateTime(endDate, endTime || startTime) : undefined;

    // Price: null for free events, numeric string for paid
    const finalPrice = isFreeEvent ? undefined : (priceValue || undefined);

    const eventData: CreateEventInput = {
      title: formData.title!,
      description: formData.description!,
      category: formData.category,
      subcategory: formData.subcategory,
      tags: formData.selectedTags.length > 0 ? formData.selectedTags : undefined,
      location_name: formData.location_name!,
      location_city: formData.location_city!,
      location_lat: formData.location_lat,
      location_lng: formData.location_lng,
      start_date: fullStartDate,
      end_date: fullEndDate,
      price: finalPrice,
      contact_phone: formData.contact_phone || undefined,
      contact_email: formData.contact_email || undefined,
      contact_whatsapp: formData.contact_whatsapp || undefined,
    };

    const result = await createEvent(eventData);

    setIsSubmitting(false);

    if (result.error) {
      setSubmitError(result.error);
      return;
    }

    // Show success message based on event status
    const createdEvent = result.data as { status?: string } | null;
    if (createdEvent?.status === 'approved') {
      alert(t('success'));
    } else {
      alert(t('successPending'));
    }

    router.push('/events');
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.category && formData.subcategory);
      case 2:
        return !!(formData.title && formData.description);
      case 3:
        return !!(formData.location_name && formData.location_city && startDate && startTime);
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Get subcategory options for selected category
  const getSubcategoryOptions = () => {
    if (!formData.category) return [];
    const category = getCategoryById(formData.category);
    if (!category) return [];
    return category.subcategories.map((sub) => ({
      value: sub,
      label: tSubcategories(sub),
    }));
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle>Connexion requise</CardTitle>
            <CardDescription>
              Vous devez être connecté pour créer un événement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">
                {tAuth('login')}
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              {tAuth('noAccount')}{' '}
              <Link href="/auth/register" className="text-primary hover:underline">
                {tAuth('register')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back button */}
      <Button asChild variant="ghost" className="mb-6">
        <Link href="/events">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Link>
      </Button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1">
          Partagez votre événement avec la communauté de la Petite Côte
        </p>
      </div>

      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-12 sm:w-20 md:w-32 mx-2 rounded transition-colors ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`text-xs sm:text-sm ${
                currentStep >= step.id
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {t(step.key)}
            </span>
          ))}
        </div>
      </div>

      {/* Form steps */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && t('categorySelection.title')}
            {currentStep === 2 && t('step2')}
            {currentStep === 3 && t('step3')}
            {currentStep === 4 && t('step4')}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && t('categorySelection.subtitle')}
            {currentStep === 2 && 'Décrivez votre événement'}
            {currentStep === 3 && 'Où et quand a lieu votre événement ?'}
            {currentStep === 4 && 'Vérifiez et soumettez votre événement'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error display */}
          {submitError && (
            <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Step 1: Category Selection */}
          {currentStep === 1 && (
            <>
              {/* Category cards grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {EVENT_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      updateFormData('category', category.id);
                      updateFormData('subcategory', '');
                    }}
                    className={cn(
                      'flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:scale-[1.02]',
                      formData.category === category.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-card'
                    )}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {categoryIcons[category.icon]}
                    </div>
                    <span className="text-sm font-medium text-center">
                      {tCategories(category.id)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Subcategory combobox - shows after category selection */}
              {formData.category && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label>{t('categorySelection.subcategoryTitle')}</Label>
                  <Combobox
                    options={getSubcategoryOptions()}
                    value={formData.subcategory || ''}
                    onChange={(value) => updateFormData('subcategory', value)}
                    placeholder={t('categorySelection.subcategoryPlaceholder')}
                    allowCustom={true}
                  />
                </div>
              )}

              {/* Tags section */}
              {formData.subcategory && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <Label>{t('categorySelection.tagsTitle')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t('categorySelection.tagsSubtitle')}
                    </p>
                  </div>

                  {Object.entries(EVENT_TAGS).map(([group, tags]) => (
                    <div key={group} className="space-y-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {tTags(`groups.${group}`)}
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                              formData.selectedTags.includes(tag.id)
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            )}
                          >
                            {tTags(tag.id)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Step 2: Basic info */}
          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'événement *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Concert de Youssou N'Dour"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre événement en détail..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                />
              </div>

              {/* Show selected category */}
              {formData.category && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-sm text-muted-foreground">Catégorie:</span>
                  <Badge
                    style={{
                      backgroundColor: `${getCategoryById(formData.category)?.color}20`,
                      color: getCategoryById(formData.category)?.color,
                    }}
                  >
                    {tCategories(formData.category)}
                  </Badge>
                  {formData.subcategory && (
                    <>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-sm">{formData.subcategory}</span>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {/* Step 3: Location & Time */}
          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="locationName">{t('fields.locationName')} *</Label>
                <LocationAutocomplete
                  value={formData.location_name || ''}
                  onSelect={(location) => {
                    updateFormData('location_name', location.name);
                    // Auto-fill city if detected
                    if (location.city) {
                      updateFormData('location_city', location.city);
                    }
                    // Auto-fill coordinates if available
                    if (location.lat && location.lng) {
                      setFormData((prev) => ({
                        ...prev,
                        location_lat: location.lat,
                        location_lng: location.lng,
                      }));
                    }
                  }}
                  placeholder={t('fields.locationSearch')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t('fields.city')} *</Label>
                <Select
                  value={formData.location_city}
                  onValueChange={(value) => updateFormData('location_city', value as City)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une ville" />
                  </SelectTrigger>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {tCities(city)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Picker */}
              <div className="space-y-2">
                <Label>
                  <MapPin className="h-4 w-4 inline mr-2" />
                  Localisation précise (optionnel)
                </Label>
                <Suspense
                  fallback={
                    <div className="h-64 rounded-lg border border-border flex items-center justify-center bg-muted/30">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  }
                >
                  <LocationPicker
                    value={
                      formData.location_lat && formData.location_lng
                        ? { lat: formData.location_lat as number, lng: formData.location_lng as number }
                        : null
                    }
                    centerOnValue={true}
                    onChange={(location) => {
                      if (location) {
                        setFormData((prev) => ({
                          ...prev,
                          location_lat: location.lat,
                          location_lng: location.lng,
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          location_lat: undefined,
                          location_lng: undefined,
                        }));
                      }
                    }}
                  />
                </Suspense>
              </div>

              {/* Start date and time */}
              <div className="space-y-2">
                <Label>{t('fields.startDate')} *</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="Heure"
                  />
                </div>
              </div>

              {/* End date and time */}
              <div className="space-y-2">
                <Label>{t('fields.endDate')}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="Heure"
                  />
                </div>
              </div>

              {/* Price section */}
              <div className="space-y-2">
                <Label>Prix</Label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFreeEvent(true)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      isFreeEvent
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    Gratuit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFreeEvent(false)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                      !isFreeEvent
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    Payant
                  </button>

                  {/* Price input - inline when paid */}
                  {!isFreeEvent && (
                    <div className="flex items-center gap-2 ml-2 animate-in fade-in slide-in-from-left-2">
                      <Input
                        id="price"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="5000"
                        value={priceValue}
                        onChange={(e) => {
                          // Only allow numbers
                          const val = e.target.value.replace(/\D/g, '');
                          setPriceValue(val);
                        }}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">FCFA</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 4: Contact & Image */}
          {currentStep === 4 && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-2" />
                    Téléphone
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    value={formData.contact_phone}
                    onChange={(e) => updateFormData('contact_phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">
                    <MessageCircle className="h-4 w-4 inline mr-2" />
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="+221 77 123 45 67"
                    value={formData.contact_whatsapp}
                    onChange={(e) => updateFormData('contact_whatsapp', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.contact_email}
                  onChange={(e) => updateFormData('contact_email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Affiche ou visuel</Label>
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Télécharger une image
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG jusqu'à 5MB
                  </p>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                  />
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <label htmlFor="image-upload" className="cursor-pointer">
                      Choisir une image
                    </label>
                  </Button>
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold">Aperçu</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Titre:</strong> {formData.title || '-'}
                  </p>
                  <p>
                    <strong>Catégorie:</strong>{' '}
                    {formData.category ? (
                      <Badge
                        style={{
                          backgroundColor: `${getCategoryById(formData.category)?.color}20`,
                          color: getCategoryById(formData.category)?.color,
                        }}
                      >
                        {tCategories(formData.category)}
                      </Badge>
                    ) : (
                      '-'
                    )}
                    {formData.subcategory && ` / ${formData.subcategory}`}
                  </p>
                  <p>
                    <strong>Lieu:</strong>{' '}
                    {formData.location_name
                      ? `${formData.location_name}, ${
                          formData.location_city
                            ? tCities(formData.location_city as City)
                            : ''
                        }`
                      : '-'}
                  </p>
                  <p>
                    <strong>Date:</strong>{' '}
                    {startDate
                      ? `${new Date(startDate).toLocaleDateString('fr-FR')} à ${startTime || '00:00'}`
                      : '-'}
                  </p>
                  <p>
                    <strong>Prix:</strong> {isFreeEvent ? 'Gratuit' : (priceValue ? `${parseInt(priceValue).toLocaleString('fr-FR')} FCFA` : 'Non spécifié')}
                  </p>
                  {formData.selectedTags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong>Tags:</strong>
                      {formData.selectedTags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tTags(tag)}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Votre événement sera soumis à validation par notre équipe avant
                  d'être publié. Vous recevrez une notification une fois
                  l'événement approuvé.
                </p>
              </div>
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Précédent
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
              >
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Soumission en cours...</>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {t('submitForReview')}
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
