import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../api/base";

// =========================================
// Load Product Images From Local Assets
// =========================================
const productImages = import.meta.glob(
  "../assets/product_img/*",
  {
    eager: true,
    import: "default",
  }
);

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================
  // Error Message Helper
  // =========================================
  const getErrorMessage = (err, fallback) => {
    if (!err) return fallback;

    if (typeof err === "string") {
      return err;
    }

    if (err.response?.data) {
      if (typeof err.response.data === "string") {
        return err.response.data;
      }

      if (typeof err.response.data === "object") {
        return (
          err.response.data.detail ||
          err.response.data.message ||
          err.response.data.error ||
          fallback
        );
      }
    }

    return err.message || fallback;
  };

  // =========================================
  // Format PHP Price
  // =========================================
  const formatPHP = (amount) => {
    return `₱${Number(amount || 0).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================
  // Refresh Access Token
  // =========================================
  const refreshAccessToken = useCallback(async () => {
    const refreshToken =
      localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    const response = await axios.post(
      `${BASE_URL}/api/token/refresh/`,
      {
        refresh: refreshToken,
      }
    );

    const newAccessToken =
      response.data.access;

    localStorage.setItem(
      "access_token",
      newAccessToken
    );

    return newAccessToken;
  }, []);

  // =========================================
  // Authenticated Request
  // =========================================
  const authenticatedRequest = useCallback(
    async (config) => {
      let accessToken =
        localStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error(
          "Please login first."
        );
      }

      const makeRequest = (token) =>
        axios({
          ...config,
          headers: {
            ...(config.headers || {}),
            Authorization: `Bearer ${token}`,
          },
        });

      try {
        return await makeRequest(accessToken);
      } catch (err) {
        if (err.response?.status !== 401) {
          throw err;
        }

        try {
          accessToken =
            await refreshAccessToken();

          return await makeRequest(accessToken);
        } catch {
          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "refresh_token"
          );

          throw new Error(
            "Your session has expired. Please login again."
          );
        }
      }
    },
    [refreshAccessToken]
  );

  // =========================================
  // Fetch Cart
  // =========================================
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } =
        await authenticatedRequest({
          method: "GET",
          url: `${BASE_URL}/api/cart/`,
        });

      setCartItems(
        data?.items ?? []
      );

      setTotalItems(
        data?.total_items ?? 0
      );

      setTotalPrice(
        data?.total_price ?? 0
      );
    } catch (err) {
      console.error(
        "Failed to fetch cart:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to load your cart."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [authenticatedRequest]);

  // =========================================
  // Load Cart
  // =========================================
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchCart();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchCart]);

  // =========================================
  // Update Quantity
  // =========================================
  const updateQuantity = async (
    cartItem,
    newQty
  ) => {
    if (newQty < 1) return;

    const product =
      cartItem.product || {};

    const stockCount =
      Number(
        product.countInStock ?? 0
      );

    if (newQty > stockCount) {
      setError(
        `Only ${stockCount} item(s) are available in stock.`
      );

      return;
    }

    try {
      setUpdatingId(
        cartItem.id
      );

      setError("");
      setMessage("");

      await authenticatedRequest({
        method: "PATCH",
        url: `${BASE_URL}/api/cart/${cartItem.id}/`,
        data: {
          qty: newQty,
        },
      });

      await fetchCart();
    } catch (err) {
      console.error(
        "Failed to update cart:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to update quantity."
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // =========================================
  // Increase Quantity
  // =========================================
  const increaseQty = (item) => {
    updateQuantity(
      item,
      item.qty + 1
    );
  };

  // =========================================
  // Decrease Quantity
  // =========================================
  const decreaseQty = (item) => {
    if (item.qty <= 1) {
      return;
    }

    updateQuantity(
      item,
      item.qty - 1
    );
  };

  // =========================================
  // Delete Cart Item
  // =========================================
  const removeCartItem = async (
    cartItemId
  ) => {
    try {
      setDeletingId(
        cartItemId
      );

      setError("");
      setMessage("");

      const response =
        await authenticatedRequest({
          method: "DELETE",
          url: `${BASE_URL}/api/cart/${cartItemId}/delete/`,
        });

      setMessage(
        response?.data?.detail ||
          "Product removed from cart."
      );

      await fetchCart();
    } catch (err) {
      console.error(
        "Failed to delete cart item:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to remove product from cart."
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================================
  // Product Image
  // =========================================
  const getProductImage = (image) => {
    if (!image) {
      return "";
    }

    // Example:
    // /images/products_images/router.jpg
    //
    // Extract:
    // router.jpg
    const fileName =
      image.split("/").pop();

    const imagePath =
      `../assets/product_img/${fileName}`;

    return (
      productImages[imagePath] ||
      ""
    );
  };

  // =========================================
  // Checkout
  // =========================================
  const handleCheckout = () => {
    if (
      cartItems.length === 0
    ) {
      return;
    }

    navigate("/checkout");
  };

  // =========================================
  // Loading
  // =========================================
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">

        <p className="text-sm text-gray-500">
          Loading your cart...
        </p>

      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr]">

        {/* =====================================
            SHOPPING CART
        ====================================== */}
        <div>

          <div className="mb-6 flex items-center justify-between">

            <h1 className="text-2xl font-bold text-black">
              Shopping Cart
            </h1>

            {cartItems.length > 0 && (
              <span className="text-sm text-gray-500">
                {totalItems}{" "}
                {totalItems === 1
                  ? "item"
                  : "items"}
              </span>
            )}

          </div>

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

          {/* =====================================
              EMPTY CART
          ====================================== */}
          {cartItems.length === 0 ? (
            <div className="border-t border-gray-300 py-16 text-center">

              <h2 className="mb-2 text-lg font-semibold text-gray-800">
                Your cart is empty
              </h2>

              <p className="mb-6 text-sm text-gray-500">
                Add some products to your cart to continue.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/products")
                }
                className="bg-[#10275e] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0c1d47]"
              >
                Continue Shopping
              </button>

            </div>
          ) : (
            <div>

              {/* =================================
                  CART ITEMS
              ================================== */}
              {cartItems.map((item) => {
                const isUpdating =
                  updatingId === item.id;

                const isDeleting =
                  deletingId === item.id;

                const product =
                  item.product || {};

                const productName =
                  product.product_name ||
                  "Product";

                const imageUrl =
                  getProductImage(
                    product.image
                  );

                const stockCount =
                  Number(
                    product.countInStock ??
                      0
                  );

                const unitPrice =
                  Number(
                    product.product_price ??
                      0
                  );

                const subtotal =
                  Number(
                    item.subtotal ?? 0
                  );

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-6 border-b border-gray-300 py-5"
                  >

                    {/* Product */}
                    <div className="flex min-w-0 items-center gap-6">

                      {/* Product Image */}
                      <div className="flex h-20 w-28 shrink-0 items-center justify-center">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              productName
                            }
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-400">
                            No image
                          </div>
                        )}

                      </div>

                      {/* Product Details */}
                      <div className="min-w-0">

                        {/* Product Name */}
                        <h2 className="truncate text-sm font-semibold text-black">
                          {productName}
                        </h2>

                        {/* Quantity */}
                        <div className="mt-2 flex items-center gap-2 text-xs">

                          <span>
                            Qty:
                          </span>

                          {/* Decrease */}
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQty(item)
                            }
                            disabled={
                              item.qty <= 1 ||
                              isUpdating
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 shadow-sm transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            -
                          </button>

                          {/* Quantity */}
                          <span className="min-w-5 text-center font-medium">
                            {isUpdating
                              ? "..."
                              : item.qty}
                          </span>

                          {/* Increase */}
                          <button
                            type="button"
                            onClick={() =>
                              increaseQty(item)
                            }
                            disabled={
                              item.qty >=
                                stockCount ||
                              isUpdating
                            }
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 shadow-sm transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>

                        </div>

                        {/* Price */}
                        <p className="mt-2 text-xs font-medium">
                          Price:{" "}
                          {formatPHP(
                            unitPrice
                          )}
                        </p>

                        {/* Subtotal */}
                        <p className="mt-1 text-xs text-gray-500">
                          Subtotal:{" "}
                          {formatPHP(
                            subtotal
                          )}
                        </p>

                        {/* Stock */}
                        <p className="mt-1 text-[11px] text-gray-400">
                          {stockCount} available
                        </p>

                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      type="button"
                      onClick={() =>
                        removeCartItem(
                          item.id
                        )
                      }
                      disabled={isDeleting}
                      aria-label="Remove item"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xl text-black transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isDeleting
                        ? "..."
                        : "×"}
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* =====================================
            ORDER SUMMARY
        ====================================== */}
        <div>

          <div className="border border-gray-100 bg-white px-8 py-8 shadow-md">

            <h2 className="mb-7 text-center text-2xl font-bold text-black">
              Order Summary
            </h2>

            {/* Subtotal */}
            <div className="flex items-center justify-between border-b border-gray-400 px-4 pb-6 text-sm font-semibold">

              <span>
                Sub Total
              </span>

              <span>
                {formatPHP(
                  totalPrice
                )}
              </span>

            </div>

            {/* Total */}
            <div className="flex items-center justify-between px-4 py-6 text-sm font-semibold">

              <span>
                Total
              </span>

              <span>
                {formatPHP(
                  totalPrice
                )}
              </span>

            </div>

            {/* Checkout Button */}
            <div className="px-8">

              <button
                type="button"
                onClick={
                  handleCheckout
                }
                disabled={
                  cartItems.length === 0
                }
                className="w-full rounded-lg bg-[#10275e] py-3 text-sm font-medium text-white transition hover:bg-[#0c1d47] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                Checkout
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Cart;