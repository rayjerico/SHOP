import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../api/base";

const ProductDetails = () => {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =========================
  // Fetch Product
  // =========================
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setMessage("");

      try {
        const response = await axios.get(
          `${BASE_URL}/api/products/${id}/`
        );

        setProduct(response.data);

        // Reset quantity when changing products
        setQty(1);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // =========================
  // Increase Quantity
  // =========================
  const increaseQty = () => {
    if (!product) return;

    if (qty < product.countInStock) {
      setQty((prev) => prev + 1);
    }
  };

  // =========================
  // Decrease Quantity
  // =========================
  const decreaseQty = () => {
    if (qty > 1) {
      setQty((prev) => prev - 1);
    }
  };

  // =========================
  // Refresh Access Token
  // =========================
  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("No refresh token found.");
    }

    const response = await axios.post(
      `${BASE_URL}/api/token/refresh/`,
      {
        refresh: refreshToken,
      }
    );

    const newAccessToken = response.data.access;

    localStorage.setItem("access_token", newAccessToken);

    return newAccessToken;
  };

  // =========================
  // Add To Cart
  // =========================
  const addToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    setMessage("");
    setMessageType("");

    let accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      setMessage("Please login before adding products to your cart.");
      setMessageType("error");
      setAddingToCart(false);
      return;
    }

    const cartData = {
      product_id: product.id,
      qty: qty,
    };

    try {
      // First attempt
      const response = await axios.post(
        `${BASE_URL}/api/cart/add/`,
        cartData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setMessage(response.data.detail || "Product added to cart.");
      setMessageType("success");
    } catch (error) {
      // Access token expired / invalid
      if (error.response?.status === 401) {
        try {
          // Use refresh token to get a new access token
          accessToken = await refreshAccessToken();

          // Retry add to cart with new token
          const retryResponse = await axios.post(
            `${BASE_URL}/api/cart/add/`,
            cartData,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

          setMessage(
            retryResponse.data.detail || "Product added to cart."
          );
          setMessageType("success");
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);

          // Tokens are no longer valid
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");

          setMessage("Your session has expired. Please login again.");
          setMessageType("error");
        }
      } else {
        console.error("Add to cart failed:", error);

        setMessage(
          error.response?.data?.detail ||
            "Failed to add product to cart."
        );

        setMessageType("error");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  // =========================
  // Product Not Found
  // =========================
  if (!product) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <p className="text-gray-500">Product not found.</p>
      </div>
    );
  }

  // Handle both:
  // "/media/products_images/example.jpg"
  // and
  // "http://127.0.0.1:8000/media/products_images/example.jpg"
  const productImage = product.image?.startsWith("http")
    ? product.image
    : `${BASE_URL}${product.image}`;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Product section */}
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-20">
        {/* Product Image */}
        <div className="flex items-center justify-center">
          <img
            src={productImage}
            alt={product.product_name}
            className="h-[260px] w-full max-w-[380px] object-contain"
          />
        </div>

        {/* Product Information */}
        <div className="max-w-sm">
          {/* Product Name */}
          <h1 className="mb-2 text-3xl font-bold text-black">
            {product.product_name}
          </h1>

          {/* Product Price */}
          <p className="mb-3 text-2xl">
            ${Number(product.product_price).toFixed(2)}
          </p>

          {/* Stock */}
          <p className="mb-3 text-sm text-gray-800">
            Available Stocks: {product.countInStock}
          </p>

          {product.countInStock > 0 ? (
            <>
              {/* Quantity */}
              <div className="mb-3 flex items-center gap-5">
                {/* Decrease */}
                <button
                  type="button"
                  onClick={decreaseQty}
                  disabled={qty <= 1}
                  className="flex h-8 w-8 items-center justify-center bg-blue-950 text-lg text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  -
                </button>

                {/* Quantity Number */}
                <span className="min-w-[20px] text-center">
                  {qty}
                </span>

                {/* Increase */}
                <button
                  type="button"
                  onClick={increaseQty}
                  disabled={qty >= product.countInStock}
                  className="flex h-8 w-8 items-center justify-center bg-blue-950 text-lg text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  +
                </button>
              </div>

              {/* Add To Cart */}
              <button
                type="button"
                onClick={addToCart}
                disabled={addingToCart}
                className="w-full bg-blue-950 py-2 text-sm text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addingToCart ? "Adding..." : "Add to cart"}
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed bg-gray-400 py-2 text-sm text-white"
            >
              Out of Stock
            </button>
          )}

          {/* Success / Error Message */}
          {message && (
            <p
              className={`mt-3 text-sm ${
                messageType === "success"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="mt-14">
        <h2 className="mb-2 text-sm font-bold">
          Description
        </h2>

        <p className="max-w-5xl text-sm leading-5 text-gray-800">
          {product.description}
        </p>
      </div>
    </div>
  );
};

export default ProductDetails;