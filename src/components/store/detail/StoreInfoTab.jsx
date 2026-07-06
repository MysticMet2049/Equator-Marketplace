import { Link } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiMail, FiPhone } from "react-icons/fi";
import { PiWhatsappLogo } from "react-icons/pi";
import { formatDisplayValue } from "./storeDetailUtils";

export default function StoreInfoTab({
  store,
  isAuthenticated,
  showAllDesc,
  setShowAllDesc,
  whatsappUrl,
}) {
  return (
    <div className="pb-12 max-w-2xl">
      <div
        className="bg-white rounded-2xl p-6 space-y-5"
        style={{ border: "1px solid var(--color-equator-beige)" }}
      >
        <AboutBlock
          store={store}
          showAllDesc={showAllDesc}
          setShowAllDesc={setShowAllDesc}
        />
        <StoreInformation store={store} />
        <StoreContact
          store={store}
          isAuthenticated={isAuthenticated}
          whatsappUrl={whatsappUrl}
        />
      </div>
    </div>
  );
}

function AboutBlock({ store, showAllDesc, setShowAllDesc }) {
  const description = store.description || "Boutique partenaire sur Equator Marketplace.";
  const shouldCrop = description.length > 180;
  const displayedText = showAllDesc
    ? description
    : description.slice(0, 180) + (shouldCrop ? "..." : "");

  return (
    <div>
      <SectionTitle>À PROPOS</SectionTitle>
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
      >
        {displayedText}
      </p>

      {shouldCrop && (
        <button
          onClick={() => setShowAllDesc(!showAllDesc)}
          className="text-xs font-medium mt-1 flex items-center gap-1"
          style={{ color: "var(--color-equator-green)" }}
        >
          {showAllDesc ? "Voir moins" : "Voir plus"}{" "}
          {showAllDesc ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
        </button>
      )}
    </div>
  );
}

function StoreInformation({ store }) {
  const rows = [
    { label: "Catégorie", value: store.category },
    { label: "Localisation", value: store.location },
    { label: "Membre depuis", value: store.since },
    { label: "Nombre de produits", value: `${store.productCount} produits` },
    { label: "Note moyenne", value: `${store.rating}/5 (${store.reviewCount} avis)` },
    { label: "Téléphone", value: store.contact?.phone },
    { label: "WhatsApp", value: store.contact?.whatsapp },
    { label: "Email", value: store.contact?.email },
  ].filter((row) => row.value);

  return (
    <Section>
      <SectionTitle>INFORMATIONS</SectionTitle>
      {rows.map(({ label, value }) => (
        <div
          key={label}
          className="flex justify-between gap-4 py-2.5"
          style={{ borderBottom: "1px solid var(--color-equator-beige)" }}
        >
          <span
            className="text-sm"
            style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
          >
            {label}
          </span>
          <span
            className="text-sm font-medium text-right"
            style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}
          >
            {formatDisplayValue(value)}
          </span>
        </div>
      ))}
    </Section>
  );
}

function StoreContact({ store, isAuthenticated, whatsappUrl }) {
  return (
    <Section>
      <SectionTitle>CONTACT</SectionTitle>

      {!isAuthenticated ? (
        <div
          className="p-3 rounded-xl text-sm"
          style={{ background: "var(--color-equator-beige)" }}
        >
          <Link
            to="/login"
            className="font-medium"
            style={{ color: "var(--color-equator-green)" }}
          >
            Connectez-vous
          </Link>
          <span style={{ color: "var(--color-equator-muted)" }}>
            {" "}pour voir les informations de contact du vendeur.
          </span>
        </div>
      ) : (
        <div className="space-y-2">
          {store.contact?.phone && (
            <ContactItem
              href={`tel:${store.contact.phone}`}
              icon={FiPhone}
              label={`Appeler ${store.contact.phone}`}
            />
          )}

          {store.contact?.whatsapp && (
            <ContactItem
              href={whatsappUrl}
              icon={PiWhatsappLogo}
              label={`WhatsApp ${store.contact.whatsapp}`}
              whatsapp
            />
          )}

          {store.contact?.email && (
            <ContactItem
              href={`mailto:${store.contact.email}`}
              icon={FiMail}
              label={store.contact.email}
            />
          )}

          {!store.contact?.phone && !store.contact?.email && !store.contact?.whatsapp && (
            <p className="text-sm" style={{ color: "var(--color-equator-muted)" }}>
              Aucun contact disponible.
            </p>
          )}
        </div>
      )}
    </Section>
  );
}

function ContactItem({ href, icon: Icon, label, whatsapp = false }) {
  return (
    <a
      href={href}
      target={whatsapp ? "_blank" : undefined}
      rel={whatsapp ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2 text-sm"
      style={{
        color: whatsapp ? "#25d366" : "var(--color-equator-text)",
        fontFamily: "var(--font-body)",
      }}
    >
      <Icon
        size={14}
        style={whatsapp ? undefined : { color: "var(--color-equator-green)" }}
      />
      {label}
    </a>
  );
}

function Section({ children }) {
  return (
    <div style={{ borderTop: "1px solid var(--color-equator-beige)", paddingTop: "1.25rem" }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p
      className="text-xs font-semibold tracking-widest mb-3"
      style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}
    >
      {children}
    </p>
  );
}
