export const footerBrand = {
  name: "Agri-tech",
  description:
    "Nous accompagnons les projets agricoles en Haïti avec une approche moderne, pratique et orientée résultats.",
} as const;

export const footerExplorerLinks = [
  { label: "Accueil", href: "/" },
  { label: "Services agricoles", href: "/services" },
  { label: "Academy", href: "/academy" },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
] as const;

export const footerLegalLinks = [
  { label: "Politique de confidentialité", href: "/politique-confidentialite" },
  { label: "Mentions légales", href: "/mentions-legales" },
] as const;

// TODO: remplacer les URL temporaires par les profils officiels Agri-tech dès qu'ils sont confirmés.
export const footerSocialLinks = [
  { label: "Facebook", href: "#", icon: "facebook" },
  { label: "X / Twitter", href: "#", icon: "x" },
  { label: "WhatsApp", href: "#", icon: "whatsapp" },
  { label: "TikTok", href: "#", icon: "tiktok" },
  { label: "YouTube", href: "#", icon: "youtube" },
] as const;

export const footerContact = {
  location: "Haïti",
  phone: "+509 3696 0292",
  phoneHref: "tel:+50936960292",
  email: "contact@agritech509ht.com",
  emailHref: "mailto:contact@agritech509ht.com",
} as const;

export const footerNewsletter = {
  title: "Inscrivez-vous à notre newsletter",
  description:
    "Conseils pratiques, Academy et opportunités agricoles adaptés à la réalité haïtienne.",
  placeholder: "Votre email",
  buttonLabel: "S’inscrire",
} as const;
