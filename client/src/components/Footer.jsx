
import { Link } from "react-router-dom";
import logo from "../assets/bookweave-logo.png";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Our Books", to: "/books" },
  { label: "Publishing Services", to: "/services" },
  { label: "Contact Us", to: "/contact" },
];

const socialLinks = [
  {
    name: "Instagram",
    url: "https://www.instagram.com/bookweave_?exln=ZXlzdnZ3YzR1cmdp",
    icon: (
      <svg viewBox="0 0 24 24" className="size-5" fill="none">
        <defs>
          <linearGradient id="instagram-gradient" x1="0" y1="24" x2="24" y2="0">
            <stop offset="0%" stopColor="#FFDC80" />
            <stop offset="50%" stopColor="#F77737" />
            <stop offset="100%" stopColor="#C13584" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="18" height="18" rx="5"
          stroke="url(#instagram-gradient)" strokeWidth="2" />
        <circle cx="12" cy="12" r="4"
          stroke="url(#instagram-gradient)" strokeWidth="2" />
        <circle cx="17.5" cy="6.8" r="1.2" fill="#E1306C" />
      </svg>
    ),
  },
  // {
  //   name: "LinkedIn",
  //   url: "https://www.linkedin.com/in/bookweave-publication-2252a9347?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  //   icon: (
  //     <svg viewBox="0 0 24 24" fill="#0A66C2" className="size-5">
  //       <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.44c.98 0 1.79-.77 1.79-1.73V1.73C24 .77 23.19 0 22.22 0Z" />
  //     </svg>
  //   ),
  // },
  {
    name: "WhatsApp",
    url: "https://wa.me/918929818310",
    icon: (
      <svg viewBox="0 0 24 24" fill="#25D366" className="size-5">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.76 14.02c-.24.68-1.41 1.3-1.96 1.38-.51.08-1.15.11-1.86-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.27-5.06-4.47-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.07.92 2.22.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.17-.31.38-.45.51-.15.15-.3.31-.13.61.17.3.76 1.26 1.64 2.04 1.13 1.01 2.08 1.32 2.38 1.47.3.15.48.13.66-.08.18-.2.75-.88.95-1.18.2-.3.4-.25.67-.15.27.1 1.74.82 2.04.97.3.15.5.22.57.35.08.13.08.74-.16 1.42Z" />
      </svg>
    ),
  },
  {
    name: "Threads",
    url: "https://www.threads.com/@bookweave_",
    icon: (
      <svg viewBox="0 0 24 24" fill="#111111" className="size-5">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32l-1.757-1.182c.98-1.454 2.513-2.259 4.448-2.259h.044c3.194.02 5.094 1.98 5.271 5.424.104.044.206.09.306.138 1.48.723 2.567 1.823 3.144 3.18.78 1.838.678 4.748-1.56 6.942-1.86 1.82-4.102 2.616-7.274 2.64Zm-.43-9.366c-1.08.06-2.063.457-2.126 1.622-.034.622.25 1.179.79 1.53.504.327 1.197.488 1.94.447 1.007-.054 1.77-.426 2.268-1.046.41-.511.682-1.224.808-2.12a11.79 11.79 0 0 0-3.68-.433Z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/profile.php?id=61595033846124",
    icon: (
      <svg viewBox="0 0 24 24" fill="#1877F2" className="size-5">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.026 4.388 11.022 10.125 11.927v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.095 24 18.099 24 12.073Z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <>
      <footer className="w-full bg-text text-cream">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">

          {/* Brand Introduction */}
          <div className="mx-auto max-w-2xl text-center">
            <Link
              to="/"
              aria-label="BookWeave home"
              className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-2.5 shadow-sm transition-transform hover:scale-[1.02]"
            >
              <img
                src={logo}
                alt="BookWeave"
                className="h-auto w-40 object-contain sm:w-48"
              />
            </Link>

            <p className="mt-4 font-serif text-base italic text-cream/75 sm:text-lg">
              Where every story finds its voice.
            </p>

            <div className="mx-auto mt-6 h-px w-16 bg-primary" />
          </div>

          {/* Footer Navigation */}
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-9 min-[480px]:grid-cols-2 min-[480px]:gap-12 sm:mt-12">

            {/* Quick Links */}
            <div className="text-center min-[480px]:text-left">
              <h3 className="font-serif text-lg sm:text-xl">
                Quick Links
              </h3>

              <ul className="mt-4 space-y-3">
                {footerLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-cream/65 transition-colors hover:text-cream sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social Media */}
            <div className="text-center min-[480px]:text-left">
              <h3 className="font-serif text-lg sm:text-xl">
                Follow Us
              </h3>

              <div className="mt-5 flex flex-wrap justify-center gap-3 min-[480px]:justify-start sm:gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className="grid size-10 place-items-center rounded-full bg-white transition-transform hover:-translate-y-1 sm:size-11"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Separate Copyright Bar */}
      <div className="w-full bg-white px-5 py-4 text-center">
        <p className="text-xs text-text-muted sm:text-sm">
          © {new Date().getFullYear()} BookWeave. All rights reserved.
        </p>
      </div>
    </>
  );
}
