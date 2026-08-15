import { Link } from "react-router-dom";
import { useContext } from "react";
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { AuthContext } from "../context/AuthProvider";


const Header = () => {
   const { isAuthenticated } = useContext(AuthContext);
  return (
    <header className="w-full bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-black">
            RIVANSH
          </h1>
        </div>

        {/* Navigation */}
        <nav className="ml-auto mr-12 hidden items-center gap-10 md:flex">
          <a
            href="/"
            className="text-[15px] font-medium text-gray-800 transition hover:text-blue-900"
          >
            Home
          </a>

          <a
            href="/products"
            className="text-[15px] font-medium text-gray-800 transition hover:text-blue-900"
          >
            Products
          </a>

          <a
            href="#"
            className="text-[15px] font-medium text-gray-800 transition hover:text-blue-900"
          >
            Team
          </a>
        </nav>

        {/* Buttons */}
      <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="text-xl">
                <FaShoppingCart />
              </Link>
              <Link to="/profile" className="text-xl">
                <FaUser />
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-950"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="flex flex-col gap-1 md:hidden">
          <span className="h-0.5 w-6 bg-black"></span>
          <span className="h-0.5 w-6 bg-black"></span>
          <span className="h-0.5 w-6 bg-black"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
