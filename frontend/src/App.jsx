import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./pages/Hero";
import Products from "./pages/Products";
import Footer from "./pages/Footer";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import { AuthProvider } from "./context/AuthProvider";
import { PrivateRoute } from "./context/PrivateRoute";
import Cart from "./components/Cart";


function App() {
  return (
    <>
      <Router>
        <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/products" element={<Products />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/profile" element={
            <PrivateRoute>
            <Profile />
            </PrivateRoute>
          } />
            <Route path="/cart" element={
            <PrivateRoute>
            <Cart />
            </PrivateRoute>
          } />
        </Routes>
        </AuthProvider>
      </Router>
      <Footer />
    </>
  );
}

export default App;
