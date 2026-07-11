import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import dynamic from 'next/dynamic';
import {
  Building2,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  MapPin,
  Ruler,
  Utensils,
  Train,
  Trees,
  Bed,
  Bath,
  Camera,
  Shield,
  Zap,
  ShoppingBag,
  Bus,
  Hospital as HospitalIcon,
} from 'lucide-react';
import { EventTracker } from './event-tracker';
import { LeadForm } from './lead-form';
import { ContactBar } from './contact-bar';
import { PasswordProtectedPage } from './password-protected-page';
import { MicrositeGridGallery } from './microsite-grid-gallery';
import MicrositeChatbot from './microsite-chatbot';



interface Props {
  params: { slug: string };
}

interface PublicLinkData {
  property: {
    title: string;
    propertyType?: string;
    aiGeneratedDescription?: string;
    price?: string;
    priceOnRequest: boolean;
    priceNegotiable?: boolean;
    location: {
      address: string;
      city: string;
      state?: string;
      lat?: number | string;
      lng?: number | string;
    };
    verificationStatus: string;
    media?: { fileUrl: string; cdnUrl?: string | null; isCover: boolean; fileType: string }[];
    specs?: Record<string, string | number | undefined>;
    amenities?: string[] | null;
    nearbyAmenities?: { category: string; name: string; distanceKm: number; rating?: number }[];
  };
  agent: {
    name: string;
    phone?: string;
    whatsappNumber?: string;
    profilePhotoUrl?: string;
    agencyName?: string;
  };
  smartLink: { slug: string; status: string };
}

type FetchResult =
  | { status: 'ok'; data: PublicLinkData }
  | { status: 'password_required' }
  | { status: 'gone'; message: string }
  | { status: 'not_found' };

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1';

const fetchPublicLink = cache(async function fetchPublicLink(slug: string): Promise<FetchResult> {
  try {
    const res = await fetch(`${API}/smart-links/${slug}/public`, {
      next: { tags: [`property-${slug}`] },
    });

    if (res.status === 401) return { status: 'password_required' };
    if (res.status === 410) {
      const body = (await res.json().catch(() => ({}))) as { status?: string; slug?: string };
      return { status: 'gone', message: body.status === 'EXPIRED' ? 'expired' : 'disabled' };
    }
    if (!res.ok) return { status: 'not_found' };

    const json = (await res.json()) as { data: PublicLinkData };
    return { status: 'ok', data: json.data };
  } catch {
    return { status: 'not_found' };
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await fetchPublicLink(params.slug);
  if (result.status !== 'ok') return { title: 'Property Not Found' };

  const { property } = result.data;
  const cover = property.media?.find((m) => m.isCover) ?? property.media?.[0];
  const ogImage = cover?.cdnUrl ?? cover?.fileUrl;

  return {
    title: property.title,
    description:
      property.aiGeneratedDescription ??
      `${property.propertyType ?? 'Property'} in ${property.location.city}`,
    openGraph: {
      title: property.title,
      description: property.aiGeneratedDescription ?? '',
      type: 'website',
      siteName: 'SiteBank',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: property.title,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

function formatINR(value: string | undefined): string {
  if (!value) return '—';
  const num = parseFloat(value);
  if (Number.isNaN(num)) return '—';
  if (num >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(2)} Cr`;
  if (num >= 1_00_000) return `₹${(num / 1_00_000).toFixed(2)} L`;
  return `₹${num.toLocaleString('en-IN')}`;
}

function getSpecIcon(key: string) {
  const k = key.toLowerCase();
  if (k.includes('bedroom')) return <Bed className="h-4.5 w-4.5 text-primary" />;
  if (k.includes('bathroom') || k.includes('washroom')) return <Bath className="h-4.5 w-4.5 text-primary" />;
  if (k.includes('area') || k.includes('sqft')) return <Ruler className="h-4.5 w-4.5 text-primary" />;
  if (k.includes('floor')) return <HelpCircle className="h-4.5 w-4.5 text-primary" />;
  if (k.includes('age') || k.includes('year')) return <HelpCircle className="h-4.5 w-4.5 text-primary" />;
  return <HelpCircle className="h-4.5 w-4.5 text-primary" />;
}


function getAmenityIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes('school') || c.includes('college') || c.includes('university')) return <GraduationCap className="h-4 w-4 text-blue-600" />;
  if (c.includes('hospital')) return <HospitalIcon className="h-4 w-4 text-red-600" />;
  if (c.includes('mall') || c.includes('store') || c.includes('supermarket')) return <ShoppingBag className="h-4 w-4 text-orange-600" />;
  if (c.includes('restaurant')) return <Utensils className="h-4 w-4 text-yellow-600" />;
  if (c.includes('bus')) return <Bus className="h-4 w-4 text-blue-500" />;
  if (c.includes('metro') || c.includes('train')) return <Train className="h-4 w-4 text-slate-600" />;
  if (c.includes('park')) return <Trees className="h-4 w-4 text-emerald-600" />;
  return <MapPin className="h-4 w-4 text-slate-400" />;
}

function GoneScreen({ message }: { message: string }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 text-center bg-background">
      <div>
        <h1 className="text-2xl font-bold">Link no longer active</h1>
        <p className="text-muted-foreground mt-2">
          {message === 'expired'
            ? 'This property link has expired.'
            : 'This property link has been disabled by the agent.'}
        </p>
      </div>
    </div>
  );
}

const PublicPropertyMap = dynamic(() => import('@/components/map/public-property-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-muted-foreground animate-pulse rounded-2xl">
      Loading map location...
    </div>
  ),
});

function PropertyMicrosite({ data, slug }: { data: PublicLinkData; slug: string }) {
  const { property, agent } = data;
  const audioNotes = (property.media ?? []).filter((m) => m.fileType === 'AUDIO');

  // Theme helpers (use only related tokens in globals.css)
  const isVerified = property.verificationStatus === 'VERIFIED';
  const title = property.title;


  const lat = property.location?.lat ? parseFloat(String(property.location.lat)) : NaN;
  const lng = property.location?.lng ? parseFloat(String(property.location.lng)) : NaN;
  const hasMap = !isNaN(lat) && !isNaN(lng);

  const groupedAmenities: Record<string, typeof property.nearbyAmenities> = {};
  if (property.nearbyAmenities) {
    property.nearbyAmenities.forEach((a) => {
      if (!groupedAmenities[a.category]) groupedAmenities[a.category] = [];
      if (groupedAmenities[a.category]!.length < 3) {
        groupedAmenities[a.category]!.push(a);
      }
    });
  }

  return (
    <div className="min-h-dvh bg-slate-50/50 text-slate-800 font-sans flex flex-col">
      <header className="h-16 border-b border-slate-200/80 bg-white sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/10">
            <Building2 className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Site<span className="text-blue-600">Bank</span>
          </span>
        </div>
      </header>

      <EventTracker slug={slug} />

      {(property.media || []).filter(m => m.fileType === 'PHOTO' || m.fileType === 'THUMBNAIL').length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="relative rounded-3xl overflow-hidden shadow-xl bg-slate-900 border border-slate-200/60">
            <MicrositeGridGallery media={property.media || []} propertyTitle={property.title} />
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="bg-white border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            {property.verificationStatus === 'VERIFIED' && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified Listing
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {property.title}
            </h1>
            <p className="text-slate-500 text-sm sm:text-base flex items-center gap-1.5">
              <MapPin className="h-4.5 w-4.5 text-blue-600 shrink-0" /> {property.location.address}, {property.location.city}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Price</p>
              <p className="text-3xl font-black text-blue-600 mt-0.5">
                {property.priceOnRequest ? 'On Request' : formatINR(property.price)}
              </p>
              {property.priceNegotiable && !property.priceOnRequest && (
                <p className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md inline-block font-semibold mt-1">
                  Negotiable
                </p>
              )}
            </div>
            <ContactBar
              slug={slug}
              agentPhone={agent.phone}
              agentWhatsapp={agent.whatsappNumber}
              propertyTitle={property.title}
            />
          </div>
        </div>
      </div>

      <div className="md:hidden max-w-5xl mx-auto px-4 mt-6 space-y-6">
        <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Listed By</p>
          <div className="flex items-center gap-3.5">
            {agent.profilePhotoUrl ? (
              <img
                src={agent.profilePhotoUrl}
                alt={agent.name}
                className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-extrabold text-base border">
                {agent.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-bold text-slate-800 leading-snug">{agent.name}</p>
              {agent.agencyName && (
                <p className="text-xs text-slate-500 mt-0.5">{agent.agencyName}</p>
              )}
            </div>
          </div>
        </div>
        <LeadForm slug={slug} propertyTitle={property.title} />
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 mb-12 grid md:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          {property.aiGeneratedDescription && (
            <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3">About this property</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.aiGeneratedDescription}
              </p>
            </div>
          )}

          {audioNotes.length > 0 && (
            <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M12 2c-1.7 0-3 1.2-3 2.6v6.8c0 1.4 1.3 2.6 3 2.6s3-1.2 3-2.6V4.6C15 3.2 13.7 2 12 2z" />
                  <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18.4v3.3M8 22h8" />
                </svg>
                Voice Notes
              </h2>
              <div className="space-y-3">
                {audioNotes.map((a, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="animate-pulse"
                      >
                        <path d="M2 10v4M6 6v12M10 3v18M14 8v8M18 5v14M22 10v4" />
                      </svg>
                    </div>
                    <audio controls className="w-full h-9">
                      <source src={a.fileUrl} />
                    </audio>
                  </div>
                ))}
              </div>
            </div>
          )}

          {property.specs && Object.keys(property.specs).length > 0 && (
            <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {Object.entries(property.specs)
                  .filter(([, v]) => v !== null && v !== undefined && v !== '')
                  .map(([k, v]) => (
                    <div
                      key={k}
                      className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                        {getSpecIcon(k)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
                          {k.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="font-extrabold text-sm text-slate-700 mt-0.5 truncate">
                          {String(v)}
                        </dd>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {hasMap && (
            <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3 gap-3 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Location Map
                </h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 underline md:no-underline md:hover:underline"
                >
                  Get Directions{' '}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                </a>
              </div>
              <div className="h-[300px] w-full rounded-2xl overflow-hidden border relative shadow-inner">
                <PublicPropertyMap
                  lat={lat}
                  lng={lng}
                  title={property.title}
                  address={`${property.location.address}, ${property.location.city}`}
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Address:</span> {property.location.address}, {property.location.city}, {property.location.state || ''}
              </p>
            </div>
          )}

          {Object.keys(groupedAmenities).length > 0 && (
            <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Verified Nearby Facilities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(groupedAmenities).map(([cat, items]) => (
                  <div key={cat} className="space-y-2.5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                      {getAmenityIcon(cat)}
                      {cat}
                    </h3>
                    <div className="space-y-1.5">
                      {items!.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
                          <span className="font-medium text-slate-700 truncate mr-2">{item.name}</span>
                          <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md shrink-0">
                            {item.distanceKm.toFixed(1)} km
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 italic mt-4 pt-2 border-t">
                *Nearby facilities are approximate and verified via Google Maps data.
              </p>
            </div>
          )}

          <MicrositeGridGallery media={property.media || []} propertyTitle={property.title} />

          {property.amenities && property.amenities.length > 0 && (
            <div className="rounded-3xl border bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b pb-3">Amenities</h2>
              <ul className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <li
                    key={a}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-600"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <aside className="hidden md:block space-y-6">
          <div className="rounded-3xl border bg-white p-6 shadow-sm space-y-4">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Listed By</p>
            <div className="flex items-center gap-3.5">
              {agent.profilePhotoUrl ? (
                <img
                  src={agent.profilePhotoUrl}
                  alt={agent.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-100 shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-extrabold text-base border">
                  {agent.name.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-800 leading-snug">{agent.name}</p>
                {agent.agencyName && (
                  <p className="text-xs text-slate-500 mt-0.5">{agent.agencyName}</p>
                )}
              </div>
            </div>
          </div>
          <LeadForm slug={slug} propertyTitle={property.title} />
        </aside>
      </div>

      <footer className="mt-auto pt-4 pb-[88px] md:pb-4 border-t border-slate-200 bg-white">
        <p className="text-xs text-center text-slate-400">
          Powered by <span className="font-bold text-slate-500">SiteBank</span>
        </p>
      </footer>

      <MicrositeChatbot slug={slug} propertyTitle={property.title} />
    </div>
  );
}

export default async function BuyerMicrositePage({ params }: Props) {
  const result = await fetchPublicLink(params.slug);

  switch (result.status) {
    case 'not_found':
      notFound();
    case 'password_required':
      return <PasswordProtectedPage slug={params.slug} />;
    case 'gone':
      return <GoneScreen message={result.message} />;
    case 'ok': {
      const { data } = result;
      if (data.smartLink.status !== 'ACTIVE') {
        return (
          <div className="min-h-dvh flex items-center justify-center p-4 text-center bg-background">
            <div>
              <h1 className="text-2xl font-bold">Link no longer active</h1>
              <p className="text-muted-foreground mt-2">
                This property link has expired or been disabled by the agent.
              </p>
            </div>
          </div>
        );
      }
      return <PropertyMicrosite data={data} slug={params.slug} />;
    }
  }
}
