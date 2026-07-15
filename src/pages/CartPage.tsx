import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { inr } from "../lib/format";
import { QuantityStepper } from "../components/QuantityStepper";
import { TAX_RATE, FREE_SHIP_OVER, computeOrderTotals } from "../lib/pricing";

export function CartPage() {
  const { items, subtotal, setQty, remove, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-4xl text-plum">Your cart is empty</h1>
        <p className="mt-3 text-plum/60">Let's find something you'll love.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-plum px-8 py-3 text-sm font-semibold text-ivory hover:bg-berry">
          Start shopping
        </Link>
      </div>
    );
  }

  const { shipping, tax, total } = computeOrderTotals(subtotal);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl text-plum">Your cart</h1>
        <button onClick={clear} className="text-sm text-plum/50 hover:text-red-600">
          Clear all
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Line items */}
        <ul className="divide-y divide-plum/10">
          {items.map(({ product, qty }) => (
            <li key={product.id} className="flex gap-4 py-5">
              <img src={product.image} alt={product.name} className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex flex-1 flex-col">
                <Link to={`/product/${product.id}`} className="font-display text-lg text-plum hover:underline">
                  {product.name}
                </Link>
                <span className="text-sm text-plum/50">{inr(product.price)} each</span>
                <div className="mt-auto flex items-center justify-between">
                  <QuantityStepper value={qty} max={product.stock} onChange={(n) => setQty(product.id, n)} />
                  <button
                    onClick={() => remove(product.id)}
                    className="rounded-full border border-plum/20 bg-white px-4 py-2 text-sm font-medium text-plum/70 hover:border-red-300 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <span className="font-semibold">{inr(product.price * qty)}</span>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="h-fit rounded-xl2 bg-white p-6 shadow-soft">
          <h2 className="text-xl text-plum">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={inr(subtotal)} />
            <Row label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`} value={inr(tax)} />
            <Row label="Shipping" value={shipping === 0 ? "Free" : inr(shipping)} />
            <div className="my-3 h-px bg-plum/10" />
            <Row label="Total" value={inr(total)} bold />
          </dl>
          {shipping > 0 && (
            <p className="mt-3 text-xs text-plum/50">
              Add {inr(FREE_SHIP_OVER - subtotal)} more for free shipping.
            </p>
          )}
          <Link
            to="/checkout"
            className="mt-6 block rounded-full bg-plum py-3 text-center text-sm font-semibold text-ivory hover:bg-berry"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-base font-semibold text-ink" : "text-plum/70"}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
