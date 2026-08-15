import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { BASE_URL } from "../api/base";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function fetchProducts() {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/products/`
        );

        if (!ignore) {
          setProducts(response.data);
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, []);

  // Show only the first 6 products unless "View all products" is clicked
  const displayedProducts = showAll ? products : products.slice(0, 6);

  return (
    <section className="px-6 py-16">
      {/* Heading */}
      <h2 className="mb-12 text-center text-2xl font-extrabold tracking-wide text-[#10265A] md:text-3xl">
        PRODUCT LIST
      </h2>

      {/* Product grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {displayedProducts.map((item) => (
          <Link
            key={item.id}
            to={`/products/${item.id}`}
            className="block"
          >
            <article className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-lg">
              {/* Product image */}
              <img
                src={`http://127.0.0.1:8000${item.image}`}
                alt={item.product_name}
                className="h-70 w-full object-contain p-6"
              />

              {/* Details */}
              <div className="flex flex-1 flex-col justify-between px-6 pb-6">
                {/* Name + price */}
                <div className="mb-1 flex items-start justify-between">
                  <p className="text-sm font-semibold text-gray-800">
                    {item.product_name}
                  </p>

                  <p className="text-sm font-semibold text-gray-700">
                    ${item.product_price}
                  </p>
                </div>

                {/* Brand */}
                <p className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">
                  {item.brand}
                </p>

                {/* Buy button */}
                <button
                  type="button"
                  className="self-end rounded bg-[#10265A] px-4 py-1.5 text-xs font-semibold tracking-wide text-white transition hover:bg-[#0b1d45]"
                >
                  BUY
                </button>
              </div>
            </article>
          </Link>
        ))}
      </div>

      {/* View-all CTA */}
      {!showAll && products.length > 6 && (
        <div className="mt-14 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="rounded bg-[#10265A] px-8 py-2.5 text-sm font-semibold tracking-wide text-white transition hover:bg-[#0b1d45]"
          >
            View all products
          </button>
        </div>
      )}
    </section>
  );
};

export default ProductList;
