import {
  Search,
  ShoppingCart,
  ShoppingBasket,
  Wallet,
  PackageCheck,
} from "lucide-react";

const steps = [
  {
    icon: <Search size={42} strokeWidth={2} />,
    title: "BROWSE",
  },
  {
    icon: <ShoppingCart size={42} strokeWidth={2} />,
    title: "ADD TO CART",
  },
  {
    icon: <ShoppingBasket size={42} strokeWidth={2} />,
    title: "CHECKOUT",
  },
  {
    icon: <Wallet size={42} strokeWidth={2} />,
    title: "PAYMENT",
  },
  {
    icon: <PackageCheck size={42} strokeWidth={2} />,
    title: "THEN WAIT",
  },
];

const GuideShop = () => {
  return (
    <section className="bg-[#15285D] py-20 text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Heading */}
        <div className="max-w-3xl">
          <h2 className="text-4xl font-extrabold uppercase tracking-wide">
            ONE STOP ONE SHOP
          </h2>

          <p className="mt-5 text-base leading-7 text-slate-300">
            We deliver reliable, high-performance equipment designed to support
            seamless communication, secure networks, and dependable connectivity
            for homes, businesses, and enterprises.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group flex h-48 flex-col items-center justify-center rounded-xl bg-white text-[#15285D] shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="mb-6 transition-transform duration-300 group-hover:scale-110">
                {step.icon}
              </div>

              <h3 className="text-lg font-bold uppercase tracking-wide text-center">
                {step.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GuideShop;
