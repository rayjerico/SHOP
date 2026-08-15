import { ArrowUpRight } from "lucide-react";

const linkGroups = [
  {
    title: "Quick links",
    links: ["So gehts", "Erfahrung", "Aligner", "Preise", "Standorte"],
  },
  {
    title: "Newz",
    links: ["Blog", "FAQ", "Lift Media", "Offene Stellen", "Presse kit"],
  },
  {
    title: "Behandlung",
    links: ["Gratis Termin", "Freunde einladen", "Patienteninformationen"],
  },
];

function Footer() {
  return (
    <footer className="bg-[#10275a] px-6 py-14 font-sans text-white sm:px-10 lg:min-h-[605px] lg:px-16 lg:py-[59px]">
      <div className="mx-auto max-w-[1141px]">
        <div className="grid gap-12 lg:grid-cols-[488px_190px_214px_1fr] lg:gap-0">
          <div>
            <a
              href="/"
              aria-label="Lift home"
              className="inline-flex h-[51px] w-[84px] items-center justify-center border-[5px] border-white text-[28px] font-black leading-none tracking-[-0.14em]"
            >
              LIFT
            </a>

            <nav
              aria-label="Social media"
              className="mt-6 flex flex-wrap gap-x-9 gap-y-3 text-[16px]"
            >
              {["Facebook", "Instagram", "Linkedin", "Pinterest"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="transition-opacity hover:opacity-70"
                  >
                    {item}
                  </a>
                ),
              )}
            </nav>

            <div className="mt-[101px] max-w-[338px]">
              <h2 className="text-[20px] font-semibold leading-tight">
                Wir halten dich auf dem laufenden
              </h2>
              <form
                className="mt-9 border-b border-white/25"
                onSubmit={(event) => event.preventDefault()}
              >
                <label htmlFor="footer-email" className="sr-only">
                  Deine E-Mail Adresse
                </label>
                <div className="flex items-center gap-3 pb-8">
                  <input
                    id="footer-email"
                    type="email"
                    placeholder="Deine E-Mail Adresse"
                    className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-white"
                  />
                  <button
                    type="submit"
                    aria-label="Newsletter anmelden"
                    className="shrink-0 transition-transform hover:translate-x-0.5 hover:-translate-y-0.5"
                  >
                    <ArrowUpRight size={26} strokeWidth={1.8} />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {linkGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-[16px] font-semibold">{group.title}</h2>
              <ul className="mt-5 space-y-4 text-[16px] text-white/75">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-white">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-[141px] flex flex-col gap-5 text-[14px] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2020 Lift Media.All right reserved</p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-11 gap-y-3">
            {["Datenschutz", "Impressum", "Cookie Policy", "AGBs"].map(
              (item) => (
                <a
                  key={item}
                  href="#"
                  className="transition-opacity hover:opacity-70"
                >
                  {item}
                </a>
              ),
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
