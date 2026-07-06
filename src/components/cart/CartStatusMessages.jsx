// Messages de validation ou d'erreur affichés au-dessus du panier.
export default function CartStatusMessages({ error, orderError, orderMessage }) {
  return (
    <>
      {(orderError || error) && (
        <p
          className="text-sm mb-4"
          style={{ color: "#dc2626", fontFamily: "var(--font-body)" }}
        >
          {orderError || error}
        </p>
      )}

      {orderMessage && (
        <p
          className="text-sm mb-4"
          style={{
            color: "var(--color-equator-green)",
            fontFamily: "var(--font-body)",
          }}
        >
          {orderMessage}
        </p>
      )}
    </>
  );
}
