interface SocialLink {
  icon: string;
  label: string;
}

const socialLinks: SocialLink[] = [
  { icon: 'bxl-facebook', label: 'Facebook' },
  { icon: 'bxl-instagram', label: 'Instagram' },
  { icon: 'bxl-twitter', label: 'Twitter' },
  { icon: 'bxl-youtube', label: 'YouTube' },
];

const contactItems: { icon: string; text: string }[] = [
  { icon: 'bxs-phone', text: '+54 11 5555-0123' },
  { icon: 'bxs-envelope', text: 'info@rockmerch.com.ar' },
  { icon: 'bxs-map', text: 'Av. Corrientes 1234, CABA, Argentina' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Main row: 1 col mobile, 3 cols desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Column 1: Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-white text-2xl font-bold tracking-wide uppercase">
              Rock Merch & Roll
            </h3>
            <p className="mt-3 text-gray-300 text-sm leading-relaxed">
              El santuario del merchandising de rock. Acá encontrás remeras, buzos, gorras y
              accesorios de tus bandas favoritas. Todo con la actitud que el rock merece.
            </p>
          </div>

          {/* Column 2: Contact */}
          <div className="text-center md:text-left">
            <h4 className="text-white text-lg font-semibold mb-4 uppercase tracking-wide">
              Contacto
            </h4>
            <ul className="space-y-3">
              {contactItems.map((item) => (
                <li key={item.icon} className="flex items-center justify-center md:justify-start gap-3">
                  <i className={`bx ${item.icon} text-coral text-xl flex-shrink-0`} aria-hidden="true" />
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social */}
          <div className="text-center md:text-left">
            <h4 className="text-white text-lg font-semibold mb-4 uppercase tracking-wide">
              Seguinos
            </h4>
            <div className="flex justify-center md:justify-start gap-4">
              {socialLinks.map((link) => (
                <span
                  key={link.label}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-300"
                >
                  <i className={`bx ${link.icon} text-xl`} aria-hidden="true" />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Separator */}
        <hr className="my-8 border-gray-700" />

        {/* Bottom credit row */}
        <p className="text-center text-sm text-gray-500">
          Designed &amp; Developed by Bruno Pezman
        </p>
      </div>
    </footer>
  );
}
