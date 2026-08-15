import Jollibeat from "../assets/partner/jollibeat.png";
import Kisko from "../assets/partner/kisko.png";
import Malasme from "../assets/partner/malasme.png";
import Mangsinakal from "../assets/partner/mangsinakal.png";
import Nyek from "../assets/partner/nyek.png";
import Puregreen from "../assets/partner/puregreen.png";

const partners = [
  {
    name: "Jollibeat",
    website: "https://www.jollibee.com.ph/",
    image: Jollibeat,
  },
  {
    name: "Kisko",
    website: "https://www.cisco.com/",
    image: Kisko,
  },
  {
    name: "Malasme",
    website: "https://luckyme.ph/",
    image: Malasme,
  },
  {
    name: "Mangsinakal",
    website: "https://www.manginasal.ph/",
    image: Mangsinakal,
  },
  {
    name: "Ngek",
    website: "https://www.nike.com/ph/",
    image: Nyek,
  },
  {
    name: "Puregreen",
    website: "https://puregold.com.ph/",
    image: Puregreen,
  },
];

function Partner() {
  return (
    <section className="overflow-hidden bg-[#10275a] py-14 text-white sm:py-16 lg:min-h-[405px] lg:py-[58px]">
      <div className="mx-auto max-w-[1322px] px-5 sm:px-10 lg:px-0">
        <h2 className="text-[32px] font-semibold tracking-tight sm:text-[40px]">
          Our Partner
        </h2>
      </div>

   <div className="mt-8 overflow-hidden">
  <div className="partner-track">
    {[...partners, ...partners].map((partner, index) => (
      <a
        key={index}
        href={partner.website}
        target="_blank"
        rel="noreferrer"
        className="partner-item block overflow-hidden rounded-[10px] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <img
          src={partner.image}
          alt={partner.name}
          className="h-[153px] w-full object-contain p-3"
        />
      </a>
    ))}
  </div>
</div>
    </section>
  );
}

export default Partner;
