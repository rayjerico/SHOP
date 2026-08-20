import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../api/base";

// Load all local product images
const productImages = import.meta.glob(
  "../assets/product_img/*",
  {
    eager: true,
    import: "default",
  }
);

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================================
  // Fetch Product
  // =========================================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/products/${id}/`
        );

        setProduct(response.data);
      } catch (err) {
        console.error("Failed to fetch product:", err);
        setError("Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================================
  // Get Local Product Image
  // =========================================
  const getProductImage = (image) => {
    if (!image) {
      return "";
    }

    // Example Django value:
    // /images/products_images/router.jpg
    //
    // Extract:
    // router.jpg
    const fileName = image.split("/").pop();

    const imagePath =
      `../assets/product_img/${fileName}`;

    return productImages[imagePath] || "";
  };

  // =========================================
  // Increase Quantity
  // =========================================
  const increaseQuantity = () => {
    if (
      product &&
      quantity < product.countInStock
    ) {
      setQuantity(
        (current) => current + 1
      );
    }
  };

  // =========================================
  // Decrease Quantity
  // =========================================
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(
        (current) => current - 1
      );
    }
  };

  // =========================================
  // Add Product To Cart
  // =========================================
  const handleAddToCart = async () => {
    const accessToken =
      localStorage.getItem("access_token");

    if (!accessToken) {
      setError("Please login first.");
      return;
    }

    if (
      quantity > product.countInStock
    ) {
      setError(
        "The selected quantity is greater than the available stock."
      );
      return;
    }

    try {
      setAddingToCart(true);
      setError("");
      setMessage("");

      await axios.post(
        `${BASE_URL}/api/cart/add/`,
        {
          product_id: product.id,
          qty: quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setMessage(
        `${product.product_name} added to your cart!`
      );
    } catch (err) {
      console.error(
        "Failed to add product to cart:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Failed to add product to cart."
      );
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================================
  // Loading State
  // =========================================
  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Loading product...
        </p>
      </main>
    );
  }

  // =========================================
  // Error State
  // =========================================
  if (error && !product) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">

        <p className="text-red-500">
          {error}
        </p>

        <Link
          to="/products"
          className="rounded bg-[#10265A] px-6 py-2 text-sm font-semibold text-white transition hover:bg-[#0b1d45]"
        >
          Back to Products
        </Link>

      </main>
    );
  }

  if (!product) {
    return null;
  }

  const imageUrl =
    getProductImage(product.image);

  return (
    <main className="px-6 py-16">
      <div className="mx-auto max-w-6xl">

        {/* Back to Products */}
        <Link
          to="/products"
          className="mb-8 inline-block text-sm font-semibold text-[#10265A] hover:underline"
        >
          ← Back to Products
        </Link>

        {/* Product Information */}
        <div className="grid gap-12 md:grid-cols-2">

          {/* Product Image */}
          <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-gray-200 bg-white p-8 shadow-sm">

            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.product_name}
                className="max-h-[400px] w-full object-contain"
              />
            ) : (
              <p className="text-sm text-gray-400">
                No image available
              </p>
            )}

          </div>

          {/* Product Details */}
          <div className="flex flex-col justify-center">

            {/* Brand */}
            {product.brand && (
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {product.brand}
              </p>
            )}

            {/* Product Name */}
            <h1 className="mb-4 text-3xl font-bold text-[#10265A] md:text-4xl">
              {product.product_name}
            </h1>

            {/* Price */}
            <p className="mb-6 text-2xl font-semibold text-gray-800">
              ₱
              {Number(
                product.product_price
              ).toLocaleString(
                "en-PH",
                {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              )}
            </p>

            {/* Available Stock */}
            <p className="mb-6 text-sm text-gray-600">

              <span className="font-semibold text-gray-800">
                Available Stock:
              </span>{" "}

              {product.countInStock}

            </p>

            {/* Error Message */}
            {error && (
              <div className="mb-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="mb-5 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {/* Product In Stock */}
            {product.countInStock > 0 ? (
              <>

                {/* Quantity Selector */}
                <div className="mb-6">

                  <p className="mb-2 text-sm font-semibold text-gray-800">
                    Quantity
                  </p>

                  <div className="flex w-fit items-center rounded border border-gray-300">

                    {/* Decrease */}
                    <button
                      type="button"
                      onClick={decreaseQuantity}
                      disabled={
                        quantity <= 1 ||
                        addingToCart
                      }
                      className="px-4 py-2 text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>

                    {/* Quantity */}
                    <span className="min-w-[50px] px-4 text-center">
                      {quantity}
                    </span>

                    {/* Increase */}
                    <button
                      type="button"
                      onClick={increaseQuantity}
                      disabled={
                        quantity >=
                          product.countInStock ||
                        addingToCart
                      }
                      className="px-4 py-2 text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>

                  </div>
                </div>

                {/* Add To Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full rounded bg-[#10265A] px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#0b1d45] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {addingToCart
                    ? "Adding..."
                    : "Add to Cart"}
                </button>

              </>
            ) : (
              <button
                type="button"
                disabled
                className="w-full cursor-not-allowed rounded bg-gray-400 px-8 py-3 text-sm font-semibold tracking-wide text-white"
              >
                Out of Stock
              </button>
            )}

          </div>
        </div>

        {/* Product Description */}
        <div className="mt-16 border-t border-gray-200 pt-10">

          <h2 className="mb-4 text-2xl font-bold text-[#10265A]">
            Product Description
          </h2>

          <p className="max-w-4xl leading-8 text-gray-600">
            {product.description}
          </p>

        </div>

      </div>
    </main>
  );
};

export default ProductDetails;