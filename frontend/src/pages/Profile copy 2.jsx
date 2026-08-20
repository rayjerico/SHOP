import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";
import { BASE_URL } from "../api/base";

const purchases = [
  {
    id: 1,
    productName: "Cisco Example",
    purchaseDate: "January 15 2025",
    quantity: 2,
    amount: "$2999",
  },
  {
    id: 2,
    productName: "Cisco Example",
    purchaseDate: "January 15 2025",
    quantity: 2,
    amount: "$2999",
  },
  {
    id: 3,
    productName: "Cisco Example",
    purchaseDate: "January 15 2025",
    quantity: 2,
    amount: "$2999",
  },
];

// Product image placeholder
const ProductImage = () => {
  return (
    <div className="flex h-[19px] w-[46px] overflow-hidden rounded-[2px] border border-gray-500 bg-gray-500">
      <div className="w-[10px] bg-gray-400" />

      <div className="flex flex-1 flex-col justify-evenly bg-gray-700 px-[2px] py-[2px]">
        <div className="grid grid-cols-8 gap-[1px]">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="h-[2px] w-[2px] bg-gray-300"
            />
          ))}
        </div>

        <div className="grid grid-cols-8 gap-[1px]">
          {Array.from({ length: 8 }).map((_, index) => (
            <span
              key={index}
              className="h-[2px] w-[2px] bg-gray-300"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { setIsAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // Refresh access token
  // =========================================
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      throw new Error("Your session has expired. Please login again.");
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/token/refresh/`,
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken = response.data.access;

      if (!newAccessToken) {
        throw new Error("Unable to refresh your session.");
      }

      localStorage.setItem("access_token", newAccessToken);

      return newAccessToken;
    } catch (err) {
      console.error("Token refresh failed:", err);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      setIsAuthenticated(false);

      throw new Error(
        "Your session has expired. Please login again."
      );
    }
  }, [setIsAuthenticated]);

  // =========================================
  // Get user profile
  // =========================================
  const fetchUserProfile = useCallback(async () => {
    let accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      // First request using current access token
      let response;

      try {
        response = await axios.get(
          `${BASE_URL}/api/user/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } catch (err) {
        // Access token expired
        if (err.response?.status !== 401) {
          throw err;
        }

        console.log("Access token expired. Refreshing...");

        // Get new access token
        accessToken = await refreshAccessToken();

        // Retry profile request with new token
        response = await axios.get(
          `${BASE_URL}/api/user/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }

      console.log("Profile response:", response.data);

      setUser(response.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);

      if (err.response) {
        console.error(
          "Status:",
          err.response.status
        );

        console.error(
          "Server response:",
          err.response.data
        );

        if (err.response.status === 401) {
          setError(
            "Your session has expired. Please login again."
          );
        } else if (err.response.status === 404) {
          setError(
            "Profile endpoint not found. Check your Django /api/user/ URL."
          );
        } else if (err.response.status >= 500) {
          setError(
            "Django encountered a server error while loading your profile."
          );
        } else {
          setError("Unable to load your profile.");
        }
      } else if (err.request) {
        setError(
          "Django did not respond. Make sure the Django server is running."
        );
      } else {
        setError(
          err.message || "Unable to load your profile."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [refreshAccessToken]);

  // =========================================
  // Fetch profile when page loads
  // =========================================
  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // =========================================
  // Logout
  // =========================================
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setIsAuthenticated(false);

    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-[#fdfdfd] px-4 py-7 font-sans text-black">
      <div className="mx-auto w-full max-w-[620px]">

        {/* Profile Card */}
        <section className="min-h-[141px] border border-gray-200 bg-white px-5 py-[14px] shadow-[0_2px_2px_rgba(0,0,0,0.25)]">
          <h1 className="text-[24px] font-bold leading-tight">
            My Profile
          </h1>

          {loading ? (
            <p className="mt-5 text-[12px] text-gray-500">
              Loading profile...
            </p>
          ) : error ? (
            <p className="mt-5 text-[12px] text-red-600">
              {error}
            </p>
          ) : (
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

        {/* Purchase History */}
        <section className="mt-[21px] min-h-[322px] border border-gray-100 bg-white px-5 py-[11px] shadow-[0_2px_2px_rgba(0,0,0,0.2)]">
          <h2 className="text-[24px] font-bold leading-tight">
            Purchase History
          </h2>

          {/* Table */}
          <div className="mt-[5px] w-full">

            {/* Header */}
            <div className="grid grid-cols-[1.25fr_1.3fr_1.3fr_0.8fr_0.75fr] items-center gap-2 text-[9px] font-medium">
              <div>Product Image</div>
              <div>Product Name</div>
              <div>Purchase Date</div>
              <div className="text-center">
                Quantity
              </div>
              <div className="text-right">
                Amount
              </div>
            </div>

            {/* Rows */}
            <div className="mt-[19px] space-y-[36px]">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="grid grid-cols-[1.25fr_1.3fr_1.3fr_0.8fr_0.75fr] items-center gap-2 text-[9px]"
                >
                  <div className="pl-[3px]">
                    <ProductImage />
                  </div>

                  <div>
                    {purchase.productName}
                  </div>

                  <div>
                    {purchase.purchaseDate}
                  </div>

                  <div className="text-center">
                    {purchase.quantity}
                  </div>

                  <div className="text-right">
                    {purchase.amount}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

      </div>
    </main>
  );
};

export default Profile;