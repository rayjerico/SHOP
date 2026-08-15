import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/products/${id}/`,
        );
        setProduct(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="flex h-80 items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-12 md:grid-cols-2">
        {/* Product Image */}
        <div className="flex justify-center">
          <img
            src={`http://127.0.0.1:8000${product.image}`}
            alt={product.product_name}
            className="w-full max-w-md rounded-lg border bg-white p-8 shadow"
          />
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">
          <h1 className="mb-4 text-3xl font-bold text-[#10265A]">
            {product.product_name}
          </h1>

          <p className="mb-6 text-2xl font-semibold text-gray-800">
            ${product.product_price}
          </p>

          <p className="mb-6 text-gray-600">
            <span className="font-semibold">Available Stock:</span>{" "}
            {product.countInStock}
          </p>

          {/* Quantity */}
          <div className="mb-8 flex items-center gap-4">
            <label className="font-medium">Quantity</label>

            <input
              type="number"
              min="1"
              max={product.stock_quantity}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-24 rounded border px-3 py-2 outline-none focus:border-[#10265A]"
            />
          </div>

          <button className="w-fit rounded bg-[#10265A] px-8 py-3 font-semibold text-white transition hover:bg-[#0b1d45]">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="mt-16">
        <h2 className="mb-4 text-2xl font-bold text-[#10265A]">
          Product Description
        </h2>

        <p className="leading-8 text-gray-700">{product.description}</p>
      </div>
    </section>
  );
};

export default ProductDetails;
