import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PiStorefront } from "react-icons/pi";
import ApiImage from "../common/ApiImage";

const FALLBACK_SLIDES = [
  {
    id: "equator-stores",
    type: "store",
    title: "Stores Equator",
    subtitle: "Découvrez les boutiques disponibles sur Equator Marketplace.",
    primaryLink: "/stores",
  },
  {
    id: "equator-marketplace",
    type: "store",
    title: "Boutiques partenaires",
    subtitle: "Explorez les catalogues, produits phares et offres promotionnelles.",
    primaryLink: "/stores",
  },
  {
    id: "equator-local",
    type: "store",
    title: "Commerce local",
    subtitle: "Retrouvez les stores et marques disponibles autour de vous.",
    primaryLink: "/stores",
  },
];

function getSlideId(slide) {
  return slide.storeId || slide.productId || slide.id || null;
}

function getAssetId(slide) {
  return slide.assetId || slide.coverAssetId || slide.imageAssetId || null;
}

function getCircularOffset(index, activeIndex, total) {
  let offset = index - activeIndex;
  const half = total / 2;

  if (offset > half) offset -= total;
  if (offset < -half) offset += total;

  return offset;
}

export default function HeroCarousel({ slides = [] }) {
  const heroSlides = useMemo(() => {
    const normalized = slides.filter(Boolean);
    return normalized.length > 0 ? normalized : FALLBACK_SLIDES;
  }, [slides]);

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (current >= heroSlides.length) setCurrent(0);
  }, [current, heroSlides.length]);

  const next = useCallback(() => {
    setCurrent((index) => (index + 1) % heroSlides.length);
  }, [heroSlides.length]);

  const prev = () => {
    setCurrent((index) => (index - 1 + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return undefined;
    const interval = setInterval(next, 4500);
    return () => clearInterval(interval);
  }, [isPaused, next, heroSlides.length]);

  const activeSlide = heroSlides[current] || heroSlides[0];

  return (
    <section
      data-testid="home-hero-carousel"
      className="relative overflow-hidden pt-24 pb-14 md:pt-28 md:pb-18"
      style={{
        background:
          "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.16), transparent 30%), radial-gradient(circle at 82% 16%, rgba(255,255,255,0.12), transparent 24%), linear-gradient(135deg, #0F6B4C 0%, #1F8A5B 52%, #2FA36B 100%)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-10 items-center min-h-[430px]">
          <div className="relative z-20 text-white max-w-xl">
            <p className="text-xs uppercase tracking-[0.24em] mb-4 opacity-80" style={{ fontFamily: "var(--font-body)" }}>
              Stores partenaires
            </p>

            <h1 className="text-4xl md:text-6xl font-light leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Découvrez les boutiques Equator
            </h1>

            <p className="mt-5 text-sm md:text-base leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.84)", fontFamily: "var(--font-body)" }}>
              Explorez les stores, leurs produits promotionnels, leurs produits phares et leurs catalogues.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">

              <Link
                to="/stores"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{
                  color: "white",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.32)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Voir les stores
              </Link>
            </div>
          </div>

          <div data-testid="home-hero-slides" className="relative h-[410px] md:h-[450px] overflow-hidden">
            {heroSlides.map((slide, index) => {
              const offset = getCircularOffset(index, current, heroSlides.length);
              if (Math.abs(offset) > 2) return null;

              const distance = Math.abs(offset);
              const translate = offset * 215;
              const scale = distance === 0 ? 1 : distance === 1 ? 0.84 : 0.68;
              const opacity = distance === 0 ? 1 : distance === 1 ? 0.78 : 0.38;

              return (
                <div
                  key={`${slide.id || slide.title || index}-hero-card`}
                  className="absolute top-1/2 left-1/2 transition-all duration-500 ease-out"
                  style={{
                    zIndex: 20 - distance,
                    opacity,
                    transform: `translateX(calc(-50% + ${translate}px)) translateY(-50%) scale(${scale})`,
                    filter: distance === 0 ? "none" : "saturate(0.86)",
                  }}
                >
                  <HeroStoreCard slide={slide} active={distance === 0} index={index} />
                </div>
              );
            })}

          </div>
        </div>

        {heroSlides.length > 1 && (
          <div className="relative z-20 flex items-center justify-center gap-4 mt-2">
            <button
              data-testid="home-hero-prev"
              type="button"
              onClick={prev}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:-translate-x-0.5"
              style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }}
              aria-label="Slide précédent"
            >
              <FiChevronLeft />
            </button>

            <div className="flex items-center gap-2">
              {heroSlides.slice(0, Math.min(heroSlides.length, 7)).map((slide, index) => (
                <button
                  key={`${slide.id || index}-dot`}
                  data-testid={`home-hero-dot-${index}`}
                  type="button"
                  onClick={() => setCurrent(index)}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: index === current ? "28px" : "8px",
                    background: index === current ? "white" : "rgba(255,255,255,0.48)",
                  }}
                  aria-label={`Aller au slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              data-testid="home-hero-next"
              type="button"
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:translate-x-0.5"
              style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "1px solid rgba(255,255,255,0.35)" }}
              aria-label="Slide suivant"
            >
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function HeroStoreCard({ slide, active, index }) {
  const slideId = getSlideId(slide);
  const assetId = getAssetId(slide);

  return (
    <Link
      data-testid="home-hero-store-card"
      data-slide-index={index}
      data-active={active ? "true" : "false"}
      to={slide.primaryLink || "/stores"}
      state={slide.state}
      className="block overflow-hidden rounded-3xl bg-white/95 transition-all duration-300"
      style={{
        width: active ? "300px" : "260px",
        boxShadow: active ? "0 30px 70px rgba(0,0,0,0.24)" : "0 20px 45px rgba(0,0,0,0.18)",
        border: "1px solid rgba(255,255,255,0.5)",
      }}
    >
      <div className="relative h-56 overflow-hidden" style={{ background: "#efe7db" }}>
        {assetId && slideId ? (
          <ApiImage
            assetId={assetId}
            refType="STORE"
            refEntityId={slideId}
            type="STORE_BANNER_IMAGE"
            typeCandidates={["STORE_BANNER_IMAGE", "STORE_LOGO", "OTHER"]}
            fileSizeType="MEDIUM"
            fileSizeTypeCandidates={["SMALL", "DETAIL", "THUMBNAIL"]}
            alt={slide.title || "Store"}
            loading={active ? "eager" : "lazy"}
            lazy={!active}
            className="w-full h-full object-cover"
          />
        ) : slide.image ? (
          <img
            src={slide.image}
            alt={slide.title || "Store"}
            loading={active ? "eager" : "lazy"}
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PiStorefront size={54} style={{ color: "var(--color-equator-green)" }} />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        <span className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.18em] px-3 py-1 rounded-full bg-white/90" style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
          Store
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-light line-clamp-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>
          {slide.title || "Boutique Equator"}
        </h3>
        <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>
          {slide.subtitle || "Boutique partenaire sur Equator Marketplace."}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
          Visiter <FiArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
