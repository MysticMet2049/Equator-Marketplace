import HomeSectionHeader from "./HomeSectionHeader";
import HomeSectionStatus from "./HomeSectionStatus";
import PartnerStoreCard from "./PartnerStoreCard";

// Section de la page d'accueil réservée aux stores partenaires.
export default function PartnerStoresSection({ stores, loading, error, isEmpty, testId = "home-partner-stores-section" }) {
  return (
    <section data-testid={testId} className="py-14" style={{ background: "#f0ebe3" }}>
      <div className="max-w-7xl mx-auto px-6">
        <HomeSectionHeader
          centered
          title="Nos Stores Partenaires"
          description="Soutenez les créateurs locaux et les marques engagées pour une consommation plus juste."
        />

        {loading ? (
          <HomeSectionStatus testId={`${testId}-loading`}>Chargement des stores...</HomeSectionStatus>
        ) : error ? (
          <HomeSectionStatus testId={`${testId}-error`}>Impossible de charger les stores partenaires.</HomeSectionStatus>
        ) : isEmpty ? (
          <HomeSectionStatus testId={`${testId}-empty`}>Aucun store partenaire disponible pour le moment.</HomeSectionStatus>
        ) : (
          <div data-testid={`${testId}-grid`} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stores.slice(0, 2).map((store) => (
              <PartnerStoreCard key={store.id || store.storeId || store.name} store={store} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
