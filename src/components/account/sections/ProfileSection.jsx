import { FiCamera, FiEdit2, FiShoppingBag, FiCreditCard, FiHeart } from "react-icons/fi";
import ProfilePreview from "./ProfilePreview";

export default function ProfileSection({
  profile,
  accountInitial,
  form,
  setForm,
  editMode,
  setEditMode,
  onSave,
  favoriteProducts,
  purchases,
  linkedCards,
  setActiveSection,
}) {
  return (
    <section data-testid="account-profile-section" className="space-y-8">
      <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid var(--color-equator-beige)" }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-display)" }}>
                {accountInitial}
              </div>
              <button className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-white flex items-center justify-center" style={{ border: "1px solid var(--color-equator-beige)" }}>
                <FiCamera size={14} />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-light" style={{ fontFamily: "var(--font-display)", color: "var(--color-equator-text)" }}>{profile.name}</h2>
              <p className="text-sm" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>{profile.email || profile.username}</p>
            </div>
          </div>

          <button onClick={() => setEditMode(!editMode)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ border: "1px solid var(--color-equator-beige)", color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>
            <FiEdit2 size={14} /> {editMode ? "Annuler" : "Modifier"}
          </button>
        </div>

        {editMode ? <ProfileForm form={form} setForm={setForm} onSave={onSave} /> : <ProfileInfo profile={profile} />}
      </div>

      <ProfileStats favoriteCount={favoriteProducts.length} purchaseCount={purchases.length} cardCount={linkedCards.length} />

      <ProfilePreview
        favoriteProducts={favoriteProducts}
        purchases={purchases}
        linkedCards={linkedCards}
        setActiveSection={setActiveSection}
      />
    </section>
  );
}

function ProfileForm({ form, setForm, onSave }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {[
        { key: "name", label: "Nom complet" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Téléphone" },
      ].map(({ key, label }) => (
        <label key={key} className="block">
          <span className="text-xs font-semibold tracking-widest" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>{label}</span>
          <input
            value={form[key] || ""}
            onChange={(event) => setForm((previous) => ({ ...previous, [key]: event.target.value }))}
            className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none"
            style={{ border: "1px solid var(--color-equator-beige)", fontFamily: "var(--font-body)" }}
          />
        </label>
      ))}
      <div className="md:col-span-2">
        <button onClick={onSave} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
          Enregistrer
        </button>
      </div>
    </div>
  );
}

function ProfileInfo({ profile }) {
  const rows = [
    { label: "Nom", value: profile.name },
    { label: "Email", value: profile.email || "Non renseigné" },
    { label: "Téléphone", value: profile.phone || "Non renseigné" },
    { label: "Identifiant", value: profile.username || "Non renseigné" },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {rows.map(({ label, value }) => (
        <div key={label} className="p-4 rounded-xl" style={{ background: "var(--color-equator-cream)", border: "1px solid var(--color-equator-beige)" }}>
          <p className="text-xs mb-1" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>{label}</p>
          <p className="text-sm font-medium" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>{value}</p>
        </div>
      ))}
    </div>
  );
}

function ProfileStats({ favoriteCount, purchaseCount, cardCount }) {
  const stats = [
    { label: "Favoris", value: favoriteCount, icon: FiHeart },
    { label: "Achats", value: purchaseCount, icon: FiShoppingBag },
    { label: "Comptes enseignes", value: cardCount, icon: FiCreditCard },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon }) => (
        <div key={label} className="bg-white rounded-2xl p-5" style={{ border: "1px solid var(--color-equator-beige)" }}>
          <Icon size={20} style={{ color: "var(--color-equator-green)" }} />
          <p className="text-2xl font-semibold mt-3" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>{value}</p>
          <p className="text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>{label}</p>
        </div>
      ))}
    </div>
  );
}
