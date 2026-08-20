import Hero_image from "../assets/hero_image.png";
import Partner from "./Partner";
import ProductList from "../components/ProductList";

function Hero() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#F8FAFC]">
        <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 lg:px-8">
          {/* Left Content */}
          <div className="relative z-10">
            <h1 className="max-w-xl text-5xl font-bold tracking-tight text-gray-950 md:text-6xl lg:text-7xl">
              Sit and shop, we got you!
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-gray-600">
              Your trusted source for premium networking devices and
              connectivity solutions.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/products"
                className="inline-flex items-center justify-center rounded-full bg-gray-950 px-8 py-4 text-base font-semibold text-white transition hover:bg-gray-800"
              >
                SHOP NOW
              </a>
            </div>

            {/* Stats */}
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-gray-200 pt-8">
              <div>
                <p className="text-2xl font-bold text-gray-950">20K+</p>
                <p className="mt-1 text-sm text-gray-500">Customers</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-950">500+</p>
                <p className="mt-1 text-sm text-gray-500">Products</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-950">4.9</p>
                <p className="mt-1 text-sm text-gray-500">Rating</p>
              </div>
            </div>
          </div>

          {/* Right Image Area */}
          <div className="relative">
            <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-orange-200 blur-3xl" />
            <div className="absolute bottom-10 right-0 h-40 w-40 rounded-full bg-blue-200 blur-3xl" />

            <div className="relative mx-auto max-w-md rounded-[2rem] bg-white p-4 shadow-2xl md:max-w-lg">
              <div className="overflow-hidden rounded-[1.5rem] bg-gray-100">
                <img
                  src={Hero_image}
                  alt="Featured ecommerce product"
                  className="h-[480px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <ProductList />
      <Partner />
    </>
  );
}

export default Hero;
