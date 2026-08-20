import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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

const Checkout = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Philippines",
  });

  // =========================================
  // Fetch Cart
  // =========================================
  useEffect(() => {
    const fetchCart = async () => {
      const accessToken =
        localStorage.getItem("access_token");

      if (!accessToken) {
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

        console.log(
          "Checkout cart response:",
          response.data
        );

        const items =
          response.data?.items ?? [];

        setCartItems(items);

        setTotalItems(
          Number(
            response.data?.total_items ?? 0
          )
        );

        setTotalPrice(
          Number(
            response.data?.total_price ?? 0
          )
        );

        if (items.length === 0) {
          setError("Your cart is empty.");
        }
      } catch (err) {
        console.error(
          "Failed to load checkout cart:",
          err
        );

        console.error(
          "Server response:",
          err.response?.data
        );

        if (err.response?.status === 401) {
          localStorage.removeItem(
            "access_token"
          );

          localStorage.removeItem(
            "refresh_token"
          );

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
    };

    fetchCart();
  }, [navigate]);

  // =========================================
  // Handle Form Changes
  // =========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================
  // Product Helper
  // =========================================
  const getProduct = (item) => {
    return item.product || {};
  };

  // =========================================
  // Quantity Helper
  // =========================================
  const getQuantity = (item) => {
    return Number(item.qty ?? 0);
  };

  // =========================================
  // Price Helper
  // =========================================
  const getPrice = (item) => {
    const product = getProduct(item);

    return Number(
      product.product_price ?? 0
    );
  };

  // =========================================
  // Format PHP Price
  // =========================================
  const formatPHP = (amount) => {
    return `₱${Number(
      amount || 0
    ).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =========================================
  // Product Image Helper
  // =========================================
  const getProductImage = (image) => {
    if (!image) {
      return "";
    }

    // Django may return:
    // /images/products_images/router.jpg
    //
    // Extract:
    // router.jpg

    const fileName =
      image.split("/").pop();

    const imagePath =
      `../assets/product_img/${fileName}`;

    return (
      productImages[imagePath] || ""
    );
  };

  // =========================================
  // Shipping
  // =========================================
  const shippingFee = 0;

  // Django calculates the actual payment total.
  // These values are only for frontend display.
  const subtotal =
    Number(totalPrice);

  const total =
    subtotal + shippingFee;

  // =========================================
  // Proceed to Xendit Payment
  // =========================================
  const handleCheckout = async (event) => {
    event.preventDefault();

    const accessToken =
      localStorage.getItem("access_token");

    if (!accessToken) {
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // Validate shipping form
    if (
      !form.fullName.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.postalCode.trim() ||
      !form.country.trim()
    ) {
      setError(
        "Please complete all shipping information."
      );

      return;
    }

    try {
      setCheckingOut(true);
      setError("");

      // Django expects exactly these fields
      const response = await axios.post(
        `${BASE_URL}/api/checkout/xendit`,
        {
          fullName:
            form.fullName.trim(),

          address:
            form.address.trim(),

          city:
            form.city.trim(),

          postalCode:
            form.postalCode.trim(),

          country:
            form.country.trim(),
        },
        {
          headers: {
            Authorization:
              `Bearer ${accessToken}`,

            "Content-Type":
              "application/json",
          },
        }
      );

      console.log(
        "Xendit checkout response:",
        response.data
      );

      // Django backend returns:
      // {
      //   checkout_url:
      //   "https://checkout.xendit.co/..."
      // }

      const checkoutUrl =
        response.data?.checkout_url;

      if (!checkoutUrl) {
        console.error(
          "No checkout_url returned:",
          response.data
        );

        setError(
          "Xendit payment was created, but no checkout URL was returned."
        );

        return;
      }

      // =========================================
      // Redirect Directly To Xendit
      // =========================================
      window.location.href =
        checkoutUrl;
    } catch (err) {
      console.error(
        "Xendit checkout failed:",
        err
      );

      console.error(
        "Django response:",
        err.response?.data
      );

      // Session expired
      if (err.response?.status === 401) {
        localStorage.removeItem(
          "access_token"
        );

        localStorage.removeItem(
          "refresh_token"
        );

        navigate("/login");
        return;
      }

      // Django detail error
      if (
        err.response?.data?.detail
      ) {
        setError(
          err.response.data.detail
        );

        return;
      }

      // Serializer validation errors
      if (
        err.response?.data &&
        typeof err.response.data ===
          "object"
      ) {
        const validationErrors =
          Object.values(
            err.response.data
          ).flat();

        const firstError =
          validationErrors.find(
            (message) =>
              typeof message ===
              "string"
          );

        if (firstError) {
          setError(firstError);
          return;
        }
      }

      // Django didn't respond
      if (!err.response) {
        setError(
          "Unable to connect to the Django server."
        );

        return;
      }

      setError(
        "Unable to create Xendit payment."
      );
    } finally {
      setCheckingOut(false);
    }
  };

  // =========================================
  // Loading State
  // =========================================
  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Loading checkout...
        </p>
      </main>
    );
  }

  // =========================================
  // Empty Cart State
  // =========================================
  if (cartItems.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-6">

        <h1 className="text-3xl font-bold text-[#10265A]">
          Your Cart Is Empty
        </h1>

        <p className="text-gray-500">
          Add some products before checking out.
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

        {/* =====================================
            HEADER
        ====================================== */}
        <div className="mb-8">

          <Link
            to="/cart"
            className="mb-4 inline-block text-sm font-semibold text-[#10265A] hover:underline"
          >
            ← Back to Cart
          </Link>

          <h1 className="text-3xl font-bold text-[#10265A] md:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {totalItems}{" "}
            {totalItems === 1
              ? "item"
              : "items"}{" "}
            in your order
          </p>

        </div>

        {/* =====================================
            ERROR
        ====================================== */}
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">

          {/* =====================================
              SHIPPING INFORMATION
          ====================================== */}
          <form
            onSubmit={handleCheckout}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >

            <h2 className="mb-6 text-xl font-bold text-[#10265A]">
              Shipping Information
            </h2>

            <div className="space-y-5">

              {/* Full Name */}
              <div>

                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#10265A] focus:ring-1 focus:ring-[#10265A]"
                />

              </div>

              {/* Address */}
              <div>

                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House number, street, barangay"
                  autoComplete="street-address"
                  rows="3"
                  required
                  className="w-full resize-none rounded border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#10265A] focus:ring-1 focus:ring-[#10265A]"
                />

              </div>

              {/* City + Postal Code */}
              <div className="grid gap-5 sm:grid-cols-2">

                {/* City */}
                <div>

                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="City"
                    autoComplete="address-level2"
                    required
                    className="w-full rounded border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#10265A] focus:ring-1 focus:ring-[#10265A]"
                  />

                </div>

                {/* Postal Code */}
                <div>

                  <label
                    htmlFor="postalCode"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Postal Code
                  </label>

                  <input
                    id="postalCode"
                    name="postalCode"
                    type="text"
                    value={form.postalCode}
                    onChange={handleChange}
                    placeholder="Postal code"
                    autoComplete="postal-code"
                    required
                    className="w-full rounded border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#10265A] focus:ring-1 focus:ring-[#10265A]"
                  />

                </div>

              </div>

              {/* Country */}
              <div>

                <label
                  htmlFor="country"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Country
                </label>

                <input
                  id="country"
                  name="country"
                  type="text"
                  value={form.country}
                  onChange={handleChange}
                  autoComplete="country-name"
                  required
                  className="w-full rounded border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#10265A] focus:ring-1 focus:ring-[#10265A]"
                />

              </div>

            </div>

            {/* =====================================
                PROCEED TO PAYMENT
            ====================================== */}
            <button
              type="submit"
              disabled={
                checkingOut ||
                cartItems.length === 0
              }
              className="mt-8 w-full rounded bg-[#10265A] px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#0b1d45] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {checkingOut
                ? "Creating Xendit Payment..."
                : "Proceed to Payment"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              You will be redirected to Xendit to securely complete your payment.
            </p>

          </form>

          {/* =====================================
              ORDER SUMMARY
          ====================================== */}
          <section className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-bold text-[#10265A]">
              Order Summary
            </h2>

            <div className="space-y-5">

              {cartItems.map((item) => {
                const product =
                  getProduct(item);

                const quantity =
                  getQuantity(item);

                const price =
                  getPrice(item);

                const lineTotal =
                  Number(
                    item.subtotal ??
                      price * quantity
                  );

                const imageUrl =
                  getProductImage(
                    product.image
                  );

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-gray-100 pb-5"
                  >

                    {/* Product Image */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50">

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={
                            product.product_name ||
                            "Product"
                          }
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          No Image
                        </span>
                      )}

                    </div>

                    {/* Product Info */}
                    <div className="min-w-0 flex-1">

                      <h3 className="truncate text-sm font-semibold text-gray-800">
                        {product.product_name ||
                          "Product"}
                      </h3>

                      {product.brand && (
                        <p className="mt-1 text-xs text-gray-400">
                          {product.brand}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-500">
                        Quantity: {quantity}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {formatPHP(price)} each
                      </p>

                    </div>

                    {/* Line Total */}
                    <div className="text-right">

                      <p className="text-sm font-semibold text-gray-800">
                        {formatPHP(lineTotal)}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* =====================================
                TOTALS
            ====================================== */}
            <div className="mt-6 space-y-3 text-sm">

              {/* Subtotal */}
              <div className="flex justify-between text-gray-600">

                <span>
                  Subtotal
                </span>

                <span>
                  {formatPHP(subtotal)}
                </span>

              </div>

              {/* Shipping */}
              <div className="flex justify-between text-gray-600">

                <span>
                  Shipping
                </span>

                <span>
                  {shippingFee === 0
                    ? "Free"
                    : formatPHP(
                        shippingFee
                      )}
                </span>

              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">

                <div className="flex justify-between text-lg font-bold text-[#10265A]">

                  <span>
                    Total
                  </span>

                  <span>
                    {formatPHP(total)}
                  </span>

                </div>

              </div>

            </div>

          </section>

        </div>

      </div>

    </main>
  );
};

export default Checkout;