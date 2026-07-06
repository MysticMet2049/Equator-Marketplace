import {
  FiChevronDown,
  FiChevronUp,
  FiHeart,
  FiMail,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiPhone,
} from "react-icons/fi";
import { PiWhatsappLogo } from "react-icons/pi";
import ApiImage from "../../common/ApiImage";
import StarRating from "../../common/StarRating";
import RequireAuthButton from "../../auth/RequireAuthButton";
import { formatDisplayValue } from "./storeDetailUtils";

export default function StoreSummaryCard({
  store,
  followed,
  setFollowed,
  contactOpen,
  setContactOpen,
  isAuthenticated,
  whatsappUrl,
}) {
  return (
    <div
      className="bg-white rounded-2xl -mt-10 relative z-10 p-6"
      style={{
        border: "1px solid var(--color-equator-beige)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <StoreLogo store={store} />
        <StoreMainInfo store={store} />
        <StoreActions
          followed={followed}
          setFollowed={setFollowed}
          contactOpen={contactOpen}
          setContactOpen={setContactOpen}
        />
      </div>

      {contactOpen && (
        <StoreContactButtons
          store={store}
          isAuthenticated={isAuthenticated}
          whatsappUrl={whatsappUrl}
        />
      )}
    </div>
  );
}

function StoreLogo({ store }) {
  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shrink-0 overflow-hidden"
      style={{ background: store.badgeColor, fontFamily: "var(--font-display)" }}
    >
      {store.logoId ? (
        <ApiImage
          assetId={store.logoId}
          refType={store.logoRefType}
          refEntityId={store.logoRefEntityId}
          type={store.logoType}
          typeCandidates={["STORE_LOGO", "ORGANISATION_LOGO", "STORE_BANNER_IMAGE", "OTHER"]}
          alt={`${store.name} logo`}
          fileSizeType="MEDIUM"
          fileSizeTypeCandidates={["SMALL", "THUMBNAIL"]}
          className="w-full h-full object-cover"
        />
      ) : (
        store.name.charAt(0)
      )}
    </div>
  );
}

function StoreMainInfo({ store }) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h1
          className="text-2xl font-light"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}
        >
          {store.name}
        </h1>

        <span
          className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
          style={{ background: store.badgeColor, fontFamily: "var(--font-body)" }}
        >
          {store.badge}
        </span>
      </div>

      <p
        className="text-sm mb-2"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        {store.tagline}
      </p>

      <div
        className="flex flex-wrap items-center gap-4 text-xs"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        <span className="flex items-center gap-1">
          <StarRating rating={store.rating} size={11} />
          <strong style={{ color: "var(--color-equator-text)" }}>{store.rating}</strong>
          ({store.reviewCount} avis)
        </span>
        <span className="flex items-center gap-1">
          <FiPackage size={11} /> {store.productCount} produits
        </span>
        <span className="flex items-center gap-1">
          <FiMapPin size={11} /> {formatDisplayValue(store.location)}
        </span>
        <span>Membre depuis {store.since}</span>
      </div>

    </div>
  );
}

function StoreActions({ followed, setFollowed, contactOpen, setContactOpen }) {
  return (
    <div className="flex flex-col gap-2 shrink-0">
      <RequireAuthButton
        onClick={() => setFollowed(!followed)}
        message="Connectez-vous pour suivre cette boutique et rester informé de ses nouveautés."
        className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
        style={{
          background: followed ? "var(--color-equator-green)" : "white",
          color: followed ? "white" : "var(--color-equator-text)",
          border: `1.5px solid ${followed ? "var(--color-equator-green)" : "var(--color-equator-beige)"}`,
          fontFamily: "var(--font-body)",
        }}
      >
        <FiHeart size={14} style={{ fill: followed ? "white" : "none" }} />
        {followed ? "Suivi" : "Suivre"}
      </RequireAuthButton>

      <button
        onClick={() => setContactOpen(!contactOpen)}
        className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90"
        style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}
      >
        <FiMessageCircle size={14} />
        Contacter
        {contactOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
      </button>
    </div>
  );
}

function StoreContactButtons({ store, isAuthenticated, whatsappUrl }) {
  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--color-equator-beige)" }}>
      <p
        className="text-xs font-semibold tracking-widest mb-3"
        style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
      >
        CONTACTER LE VENDEUR
      </p>

      <div className="flex flex-wrap gap-2">
        {store.contact?.phone && (
          <ContactLink
            href={`tel:${store.contact.phone}`}
            icon={FiPhone}
            label={`Appeler ${store.contact.phone}`}
            message="Connectez-vous pour appeler le vendeur."
          />
        )}

        {store.contact?.whatsapp && (
          <RequireAuthButton
            as="a"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            message="Connectez-vous pour contacter le vendeur via WhatsApp."
            onClick={(e) => !isAuthenticated && e.preventDefault()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#25d366", fontFamily: "var(--font-body)" }}
          >
            <PiWhatsappLogo size={16} /> WhatsApp
          </RequireAuthButton>
        )}

        {store.contact?.email && (
          <ContactLink
            href={`mailto:${store.contact.email}`}
            icon={FiMail}
            label={store.contact.email}
            message="Connectez-vous pour contacter le vendeur par email."
          />
        )}

        {!store.contact?.phone && !store.contact?.email && !store.contact?.whatsapp && (
          <p className="text-sm" style={{ color: "var(--color-equator-muted)" }}>
            Aucun contact disponible pour cette boutique.
          </p>
        )}
      </div>
    </div>
  );
}

function ContactLink({ href, icon: Icon, label, message }) {
  return (
    <RequireAuthButton
      as="a"
      href={href}
      message={message}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-stone-100"
      style={{
        border: "1px solid var(--color-equator-beige)",
        color: "var(--color-equator-text)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Icon size={14} /> {label}
    </RequireAuthButton>
  );
}
