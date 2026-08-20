import {
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";
import { BASE_URL } from "../api/base";

const Profile = () => {
  const { setIsAuthenticated } =
    useContext(AuthContext);

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [ordersError, setOrdersError] =
    useState("");

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

    try {
      const response = await axios.post(
        `${BASE_URL}/api/token/refresh/`,
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken =
        response.data.access;

      if (!newAccessToken) {
        throw new Error(
          "Unable to refresh your session."
        );
      }

      localStorage.setItem(
        "access_token",
        newAccessToken
      );

      return newAccessToken;
    } catch (err) {
      console.error(
        "Token refresh failed:",
        err
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      setIsAuthenticated(false);

      throw new Error(
        "Your session has expired. Please login again."
      );
    }
  }, [setIsAuthenticated]);

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
        // Try refreshing only when access token expired
        if (err.response?.status !== 401) {
          throw err;
        }

        accessToken =
          await refreshAccessToken();

        return await makeRequest(accessToken);
      }
    },
    [refreshAccessToken]
  );

  // =========================================
  // Fetch User Profile
  // =========================================
  const fetchUserProfile =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await authenticatedRequest({
            method: "GET",
            url: `${BASE_URL}/api/user/`,
          });

        setUser(response.data);
      } catch (err) {
        console.error(
          "Failed to fetch user profile:",
          err
        );

        setError(
          err.response?.data?.detail ||
            err.message ||
            "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }, [authenticatedRequest]);

  // =========================================
  // Fetch Purchase History
  // =========================================
  const fetchOrders =
    useCallback(async () => {
      try {
        setOrdersLoading(true);
        setOrdersError("");

        const response =
          await authenticatedRequest({
            method: "GET",
            url: `${BASE_URL}/api/orders/`,
          });

        console.log(
          "Purchase history response:",
          response.data
        );

        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error(
          "Failed to fetch purchase history:",
          err
        );

        setOrdersError(
          err.response?.data?.detail ||
            err.message ||
            "Unable to load purchase history."
        );
      } finally {
        setOrdersLoading(false);
      }
    }, [authenticatedRequest]);

  // =========================================
  // Load Profile + Purchase History
  // =========================================
  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
  }, [
    fetchUserProfile,
    fetchOrders,
  ]);

  // =========================================
  // Logout
  // =========================================
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setIsAuthenticated(false);

    navigate("/login");
  };

  // =========================================
  // Product Image
  // =========================================
  const getProductImage = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${BASE_URL}${image}`;
  };

  // =========================================
  // Format Date
  // =========================================
  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleDateString(
      "en-PH",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
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
  // Get Completed Purchase Items
  // =========================================
  const purchaseItems = orders
    .filter((order) => {
      return (
        order.isPaid === true ||
        order.xendit_status === "PAID" ||
        order.xendit_status === "SETTLED"
      );
    })
    .flatMap((order) => {
      return (order.items || []).map(
        (item) => ({
          ...item,

          paymentId: order.id,

          purchaseDate:
            order.paidAt,

          paymentStatus:
            order.xendit_status,
        })
      );
    });

  // =========================================
  // Render
  // =========================================
  return (
    <main className="min-h-screen bg-[#fdfdfd] px-4 py-7 font-sans text-black">

      <div className="mx-auto w-full max-w-[620px]">

        {/* =====================================
            PROFILE
        ====================================== */}
        <section className="min-h-[141px] border border-gray-200 bg-white px-5 py-[14px] shadow-[0_2px_2px_rgba(0,0,0,0.25)]">

          <h1 className="text-[24px] font-bold leading-tight">
            My Profile
          </h1>

          {/* Loading */}
          {loading ? (
            <p className="mt-5 text-[12px] text-gray-500">
              Loading profile...
            </p>
          ) : error ? (
            /* Error */
            <p className="mt-5 text-[12px] text-red-600">
              {error}
            </p>
          ) : (
            /* User Information */
            <div className="mt-[10px] space-y-[7px] text-[12px]">

              {/* Username */}
              <div className="flex items-center">

                <span className="w-[67px] font-semibold">
                  Username:
                </span>

                <span>
                  {user?.username || "N/A"}
                </span>

              </div>

              {/* Email */}
              <div className="flex items-center">

                <span className="w-[67px] font-semibold">
                  Email:
                </span>

                <span>
                  {user?.email || "N/A"}
                </span>

              </div>

            </div>
          )}

          {/* Logout */}
          <div className="mt-[11px] flex justify-end">

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-[6px] bg-red-600 px-[13px] py-[6px] text-[9px] font-medium text-white transition hover:bg-red-700"
            >
              Logout
            </button>

          </div>

        </section>

        {/* =====================================
            PURCHASE HISTORY
        ====================================== */}
        <section className="mt-[21px] min-h-[322px] border border-gray-100 bg-white px-5 py-[11px] shadow-[0_2px_2px_rgba(0,0,0,0.2)]">

          <h2 className="text-[24px] font-bold leading-tight">
            Purchase History
          </h2>

          {/* =================================
              LOADING PURCHASES
          ================================== */}
          {ordersLoading ? (
            <div className="py-14 text-center">

              <p className="text-[11px] text-gray-500">
                Loading purchase history...
              </p>

            </div>
          ) : ordersError ? (

            /* =================================
                PURCHASE ERROR
            ================================== */
            <div className="py-14 text-center">

              <p className="text-[11px] text-red-600">
                {ordersError}
              </p>

            </div>
          ) : purchaseItems.length === 0 ? (

            /* =================================
                NO PURCHASES
            ================================== */
            <div className="py-14 text-center">

              <p className="text-sm font-semibold text-gray-700">
                No purchases yet
              </p>

              <p className="mt-2 text-xs text-gray-500">
                Your completed purchases will
                appear here.
              </p>

            </div>
          ) : (

            /* =================================
                PURCHASE TABLE
            ================================== */
            <div className="mt-[12px] w-full overflow-x-auto">

              {/* Table Header */}
              <div className="grid min-w-[550px] grid-cols-[1.1fr_1.5fr_1.3fr_0.7fr_0.9fr] items-center gap-2 border-b border-gray-200 pb-2 text-[9px] font-semibold">

                <div>
                  Product Image
                </div>

                <div>
                  Product Name
                </div>

                <div>
                  Purchase Date
                </div>

                <div className="text-center">
                  Quantity
                </div>

                <div className="text-right">
                  Amount
                </div>

              </div>

              {/* =================================
                  PURCHASE ROWS
              ================================== */}
              <div className="min-w-[550px]">

                {purchaseItems.map(
                  (item) => {
                    const product =
                      item.product || {};

                    const imageUrl =
                      getProductImage(
                        product.image
                      );

                    /*
                     * orderItem.price from your
                     * current Django model is used
                     * as the purchase amount.
                     */
                    const amount =
                      Number(
                        item.price || 0
                      );

                    return (
                      <div
                        key={`${item.paymentId}-${item.id}`}
                        className="grid grid-cols-[1.1fr_1.5fr_1.3fr_0.7fr_0.9fr] items-center gap-2 border-b border-gray-100 py-4 text-[9px]"
                      >

                        {/* Product Image */}
                        <div>

                          {imageUrl ? (
                            <div className="flex h-[42px] w-[60px] items-center justify-center">

                              <img
                                src={imageUrl}
                                alt={
                                  product.product_name ||
                                  "Product"
                                }
                                className="max-h-full max-w-full object-contain"
                              />

                            </div>
                          ) : (
                            <div className="flex h-[42px] w-[60px] items-center justify-center bg-gray-100 text-[8px] text-gray-400">
                              No image
                            </div>
                          )}

                        </div>

                        {/* Product Name */}
                        <div className="pr-2 font-medium">

                          {product.product_name ||
                            "Product"}

                        </div>

                        {/* Purchase Date */}
                        <div>

                          {formatDate(
                            item.purchaseDate
                          )}

                        </div>

                        {/* Quantity */}
                        <div className="text-center">

                          {item.qty}

                        </div>

                        {/* Amount */}
                        <div className="text-right font-semibold">

                          {formatPHP(amount)}

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

        </section>

      </div>

    </main>
  );
};

export default Profile;