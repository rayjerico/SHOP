import { useState } from "react";
import P1 from "../assets/product_img/1.png";

const product = {
  id: "prod_cisco_catalyst_9300_001", // Database ID
  slug: "cisco-catalyst-9300", // URL-friendly identifier
  name: "Cisco Catalyst 9300",
  price: "$2000",
  stock: 90,
  image: P1,
  description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
};

function ProductDetails() {
  const [quantity, setQuantity] = useState(1);

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(product.stock, current + 1));
  };

  return (
    <main className="mx-auto max-w-5xl px-6 pb-20 pt-20 sm:pt-28">
      <section className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
        <div className="flex justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="w-full max-w-[280px] object-contain"
          />
        </div>

        <div className="max-w-60">
          <h1 className="text-[32px] font-bold leading-tight text-black">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl text-black">{product.price}</p>
          <p className="mt-3 text-base text-black">
            Available Stocks: {product.stock}
          </p>

          <div className="mt-3 flex items-center gap-7">
            <button
              type="button"
              aria-label="Decrease quantity"
              onClick={decreaseQuantity}
              className="flex size-[34px] items-center justify-center bg-[#14295d] text-lg text-white transition hover:bg-[#10224e]"
            >
              −
            </button>
            <span className="w-4 text-center text-base">{quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              onClick={increaseQuantity}
              className="flex size-[34px] items-center justify-center bg-[#14295d] text-lg text-white transition hover:bg-[#10224e]"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="mt-3 h-9 w-60 bg-[#14295d] text-base text-white transition hover:bg-[#10224e]"
          >
            Add to cart
          </button>
        </div>
      </section>

      <section className="mt-9">
        <h2 className="text-base font-bold text-black">Description</h2>
        <p className="mt-2 max-w-[800px] text-base leading-[1.15] text-black">
          {product.description}
        </p>
      </section>
    </main>
  );
}

export default ProductDetails;
