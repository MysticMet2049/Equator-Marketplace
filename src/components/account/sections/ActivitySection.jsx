import { FiActivity } from "react-icons/fi";
import { formatDate, formatMoney, getTransactionAmount, getTransactionDate, getTransactionLabel } from "../accountUtils";
import EmptyState from "../shared/EmptyState";
import SectionError from "../shared/SectionError";

export default function ActivitySection({ transactions, error }) {
  return (
    <section>
      <SectionError message={error} />
      {transactions.length === 0 ? (
        <EmptyState icon={FiActivity} text="Aucune activité récente." />
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid var(--color-equator-beige)" }}>
          {transactions.map((item, index) => <ActivityRow key={item.id || index} item={item} isLast={index === transactions.length - 1} />)}
        </div>
      )}
    </section>
  );
}

function ActivityRow({ item, isLast }) {
  const amount = getTransactionAmount(item);

  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4" style={{ borderBottom: isLast ? "none" : "1px solid var(--color-equator-beige)" }}>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--color-equator-text)", fontFamily: "var(--font-body)" }}>{getTransactionLabel(item)}</p>
        <p className="text-xs" style={{ color: "var(--color-equator-muted)", fontFamily: "var(--font-body)" }}>{formatDate(getTransactionDate(item))}</p>
      </div>

      <p className="text-sm font-semibold" style={{ color: amount < 0 ? "#dc2626" : "var(--color-equator-green)", fontFamily: "var(--font-body)" }}>
        {amount < 0 ? "-" : "+"}{formatMoney(Math.abs(amount))}
      </p>
    </div>
  );
}
