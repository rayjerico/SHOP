import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../api/base";

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  // =========================================
  // Get access token
  // =========================================
  const getAccessToken = () => {
    return localStorage.getItem("access_token");
  };

  // =========================================
  // Fetch Cart
  // =========================================
  const fetchCart = useCallback(async () => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      setLoading(false);
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${BASE_URL}/api/cart/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // The API returns { items, total_items, total_price }.
      // Keep support for the older array and `cart` response shapes too.
      const items = Array.isArray(response.data)
        ? response.data
        : response.data.items ?? response.data.cart ?? [];

      setCartItems(items);
    } catch (err) {
      console.error("Failed to fetch cart:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // =========================================
  // Load cart on page load
  // =========================================
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchCart();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [fetchCart]);

  // =========================================
  // Get product from cart item
  // =========================================
  const getProduct = (item) => {
    return item.product || item;
  };

  // =========================================
  // Get quantity
  // =========================================
  const getQuantity = (item) => {
    return Number(item.qty || item.quantity || 0);
  };

  // =========================================
  // Get product price
  // =========================================
  const getPrice = (item) => {
    const product = getProduct(item);

    return Number(
      product.product_price ||
        product.price ||
        item.product_price ||
        0
    );
  };

  // =========================================
  // Increase quantity
  // =========================================
  const increaseQuantity = async (item) => {
    const product = getProduct(item);
    const currentQuantity = getQuantity(item);

    const stock = Number(
      product.countInStock || 0
    );

    if (stock > 0 && currentQuantity >= stock) {
      setError(
        `Only ${stock} item${
          stock === 1 ? "" : "s"
        } available in stock.`
      );
      return;
    }

    await updateQuantity(
      item,
      currentQuantity + 1
    );
  };

  // =========================================
  // Decrease quantity
  // =========================================
  const decreaseQuantity = async (item) => {
    const currentQuantity = getQuantity(item);

    if (currentQuantity <= 1) {
      return;
    }

    await updateQuantity(
      item,
      currentQuantity - 1
    );
  };

  // =========================================
  // Update cart quantity
  // =========================================
  const updateQuantity = async (
    item,
    newQuantity
  ) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (newQuantity < 1) {
      return;
    }

    const cartId = item.id;

    try {
      setUpdatingId(cartId);
      setError("");

      await axios.put(
        `${BASE_URL}/api/cart/${cartId}/`,
        {
          qty: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      await fetchCart();
    } catch (err) {
      console.error(
        "Failed to update cart:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to update cart."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================
  // Delete cart item
  // =========================================
  const deleteCartItem = async (item) => {
    const accessToken = getAccessToken();

    if (!accessToken) {
      navigate("/login");
      return;
    }

    try {
      setDeletingId(item.id);
      setError("");

      await axios.delete(
        `${BASE_URL}/api/cart/${item.id}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setCartItems((currentItems) =>
        currentItems.filter(
          (cartItem) =>
            cartItem.id !== item.id
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete cart item:",
        err
      );

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      setError(
        err.response?.data?.detail ||
          "Unable to remove item from cart."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================
  // Calculate subtotal
  // =========================================
  const subtotal = cartItems.reduce(
    (total, item) => {
      const price = getPrice(item);
      const quantity = getQuantity(item);

      return total + price * quantity;
    },
    0
  );

  // =========================================
  // Loading
  // =========================================
  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Loading cart...
        </p>
      </main>
    );
  }

  // =========================================
  // Empty Cart
  // =========================================
  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6">
        <h1 className="text-3xl font-bold text-[#10265A]">
          Your Cart Is Empty
        </h1>

        <p className="text-gray-500">
          You haven't added any products yet.
        </p>

        <Link
          to="/products"
          className="rounded bg-[#10265A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0b1d45]"
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">

        {/* Page Title */}
        <div className="mb-8">
          <Link
            to="/products"
            className="mb-4 inline-block text-sm font-semibold text-[#10265A] hover:underline"
          >
            ← Continue Shopping
          </Link>

          <h1 className="text-3xl font-bold text-[#10265A] md:text-4xl">
            Shopping Cart
          </h1>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

          {/* =====================================
              CART ITEMS
          ====================================== */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-bold text-[#10265A]">
              Cart Items
            </h2>

            <div className="space-y-6">

              {cartItems.map((item) => {
                const product = getProduct(item);
                const quantity = getQuantity(item);
                const price = getPrice(item);

                const lineTotal =
                  price * quantity;

                const imageUrl = product.image
                  ? product.image.startsWith("http")
                    ? product.image
                    : `${BASE_URL}${product.image}`
                  : null;

                const isUpdating =
                  updatingId === item.id;

                const isDeleting =
                  deletingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-5 border-b border-gray-200 pb-6 last:border-b-0 last:pb-0 sm:flex-row"
                  >

                    {/* Product Image */}
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.product_name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          No Image
                        </span>
                      )}
                    </div>

                    {/* Product Information */}
                    <div className="flex flex-1 flex-col">

                      <div className="flex flex-col justify-between gap-3 sm:flex-row">

                        <div>
                          {product.brand && (
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                              {product.brand}
                            </p>
                          )}

                          <h3 className="text-lg font-bold text-[#10265A]">
                            {product.product_name}
                          </h3>

                          <p className="mt-2 text-sm text-gray-600">
                            ${price.toFixed(2)} each
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Stock:{" "}
                            {product.countInStock}
                          </p>
                        </div>

                        {/* Line Total */}
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-bold text-gray-800">
                            ${lineTotal.toFixed(2)}
                          </p>
                        </div>

                      </div>

                      {/* Controls */}
                      <div className="mt-5 flex flex-wrap items-center gap-4">

                        {/* Quantity */}
                        <div className="flex items-center rounded border border-gray-300">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(item)
                            }
                            disabled={
                              quantity <= 1 ||
                              isUpdating ||
                              isDeleting
                            }
                            className="px-4 py-2 text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>

                          <span className="min-w-[50px] px-4 text-center text-sm">
                            {isUpdating
                              ? "..."
                              : quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(item)
                            }
                            disabled={
                              isUpdating ||
                              isDeleting ||
                              (product.countInStock &&
                                quantity >=
                                  product.countInStock)
                            }
                            className="px-4 py-2 text-lg font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>

                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() =>
                            deleteCartItem(item)
                          }
                          disabled={
                            isDeleting ||
                            isUpdating
                          }
                          className="text-sm font-semibold text-red-600 transition hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isDeleting
                            ? "Removing..."
                            : "Remove"}
                        </button>

                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          </section>

          {/* =====================================
              CART SUMMARY
          ====================================== */}
          <section className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-bold text-[#10265A]">
              Cart Summary
            </h2>

            <div className="space-y-4">

              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Items
                </span>

                <span>
                  {cartItems.reduce(
                    (total, item) =>
                      total +
                      getQuantity(item),
                    0
                  )}
                </span>
              </div>

              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  Subtotal
                </span>

                <span>
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold text-[#10265A]">
                  <span>
                    Total
                  </span>

                  <span>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

            </div>

            {/* Checkout */}
            <button
              type="button"
              onClick={() =>
                navigate("/checkout")
              }
              className="mt-6 w-full rounded bg-[#10265A] px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#0b1d45]"
            >
              Proceed to Checkout
            </button>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="mt-3 block w-full rounded border border-[#10265A] px-8 py-3 text-center text-sm font-semibold tracking-wide text-[#10265A] transition hover:bg-gray-50"
            >
              Continue Shopping
            </Link>

          </section>
        </div>
      </div>
    </main>
  );
};

export default Cart;
