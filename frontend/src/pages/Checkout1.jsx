import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../api/base";

const Checkout = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
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

        /*
         * Supports both:
         *
         * response.data = [...]
         *
         * and:
         *
         * response.data = {
         *   cart: [...]
         * }
         */
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.cart || [];

        setCartItems(items);

        if (items.length === 0) {
          setError("Your cart is empty.");
        }
      } catch (err) {
        console.error(
          "Failed to load cart:",
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
            "Unable to load your cart."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [navigate]);

  // =========================================
  // Handle input changes
  // =========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =========================================
  // Get product
  // =========================================
  const getProduct = (item) => {
    return item.product || item;
  };

  // =========================================
  // Get quantity
  // =========================================
  const getQuantity = (item) => {
    return Number(
      item.qty ||
        item.quantity ||
        0
    );
  };

  // =========================================
  // Get price
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
  // Shipping
  // =========================================
  const shippingFee = 0;

  const total = subtotal + shippingFee;

  // =========================================
  // Create Xendit Payment
  // =========================================
  const handleCheckout = async (event) => {
    event.preventDefault();

    const accessToken =
      localStorage.getItem("access_token");

    // Make sure user is logged in
    if (!accessToken) {
      navigate("/login");
      return;
    }

    // Make sure cart isn't empty
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // Validate shipping information
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

      /*
       * Send the shipping information to Django.
       *
       * Django will:
       *
       * 1. Get the authenticated user
       * 2. Get the user's cart
       * 3. Calculate the total
       * 4. Create paymentMethod
       * 5. Create the Xendit invoice
       * 6. Return the Xendit invoice URL
       */
      const response = await axios.post(
        `${BASE_URL}/api/checkout/xendit`,
        {
          fullName: form.fullName.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Xendit checkout response:",
        response.data
      );

      /*
       * Your Django backend should return
       * the Xendit invoice URL.
       *
       * We support several possible names
       * here to make the frontend flexible.
       */
      const invoiceUrl =
        response.data.invoice_url ||
        response.data.invoiceUrl ||
        response.data.payment_url ||
        response.data.paymentUrl;

      // =========================================
      // Redirect to Xendit
      // =========================================
      if (invoiceUrl) {
        window.location.href = invoiceUrl;
        return;
      }

      /*
       * If Django successfully responded but
       * didn't provide a payment URL.
       */
      console.error(
        "Xendit URL was not returned:",
        response.data
      );

      setError(
        "Payment was created, but the Xendit payment URL was not returned."
      );
    } catch (err) {
      console.error(
        "Xendit checkout failed:",
        err
      );

      console.error(
        "Django response:",
        err.response?.data
      );

      // =========================================
      // Unauthorized
      // =========================================
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        navigate("/login");
        return;
      }

      // =========================================
      // Django detail error
      // =========================================
      if (err.response?.data?.detail) {
        setError(
          err.response.data.detail
        );
        return;
      }

      // =========================================
      // Django error
      // =========================================
      if (err.response?.data?.error) {
        setError(
          err.response.data.error
        );
        return;
      }

      // =========================================
      // Validation errors
      // =========================================
      if (
        err.response?.data &&
        typeof err.response.data === "object"
      ) {
        const data = err.response.data;

        const firstError = Object.values(data)
          .flat()
          .find(
            (message) =>
              typeof message === "string"
          );

        if (firstError) {
          setError(firstError);
          return;
        }
      }

      // =========================================
      // Server connection error
      // =========================================
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
  // Loading
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
  // Empty cart
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
              disabled={checkingOut}
              className="mt-8 w-full rounded bg-[#10265A] px-8 py-3 text-sm font-semibold tracking-wide text-white transition hover:bg-[#0b1d45] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {checkingOut
                ? "Creating Xendit Payment..."
                : "Proceed to Payment"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              You will be redirected to Xendit to complete your payment.
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

                return (
                  <div
                    key={
                      item.id ||
                      product.id
                    }
                    className="flex gap-4 border-b border-gray-100 pb-5"
                  >

                    {/* Product Image */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50">

                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={
                            product.product_name
                          }
                          className="h-full w-full object-contain"
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
                        {product.product_name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Quantity: {quantity}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        ${price.toFixed(2)}
                      </p>

                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800">
                        ${lineTotal.toFixed(2)}
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

              <div className="flex justify-between text-gray-600">
                <span>
                  Subtotal
                </span>

                <span>
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>
                  Shipping
                </span>

                <span>
                  {shippingFee === 0
                    ? "Free"
                    : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">

                <div className="flex justify-between text-lg font-bold text-[#10265A]">

                  <span>
                    Total
                  </span>

                  <span>
                    ${total.toFixed(2)}
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