"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import {
  footerBrand,
  footerContact,
  footerExplorerLinks,
  footerLegalLinks,
  footerNewsletter,
  footerSocialLinks,
} from "@/data/footer";

type SocialIconName = (typeof footerSocialLinks)[number]["icon"];

const socialIconClassName = "h-4 w-4 fill-current text-current";

function SocialIcon({ name }: { name: SocialIconName }) {
  switch (name) {
    case "facebook":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={socialIconClassName}>
          <path d="M14.2 8.3V6.9c0-.7.5-.9.8-.9h2V2.7L14.3 2.7c-3 0-3.7 2.2-3.7 3.7v1.9H8v3.4h2.6V22h3.6V11.7h3l.4-3.4h-3.4Z" />
        </svg>
      );
    case "x":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={socialIconClassName}>
          <path d="M16.7 3h3.1l-6.8 7.8L21 21h-6.4l-5-6.5L3.9 21H.8l7.3-8.3L.4 3H7l4.5 5.9L16.7 3Zm-1.1 16.2h1.7L6.1 4.7H4.3l11.3 14.5Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={socialIconClassName}>
          <path d="M12 2a9.8 9.8 0 0 0-8.4 14.9L2.4 22l5.2-1.3A9.8 9.8 0 1 0 12 2Zm0 17.8a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8 8 0 1 1 12 19.8Zm4.4-6c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.6c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.5.6.2 1.2.1 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1-.1-.1-.3-.2-.5-.3Z" />
        </svg>
      );
    case "tiktok":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={socialIconClassName}>
          <path d="M15.6 2c.3 2.4 1.7 3.9 4.1 4.1v3.4a7 7 0 0 1-4-1.2v6.4c0 4.1-2.5 6.7-6.2 6.7A6.1 6.1 0 0 1 3.3 15c0-3.8 3.1-6.4 7-6.1v3.5c-1.8-.3-3.4.8-3.4 2.6 0 1.7 1.2 2.8 2.7 2.8 1.7 0 2.6-1 2.6-3.2V2h3.4Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className={socialIconClassName}>
          <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.6-.8-2-.9C16 4 12 4 12 4s-4 0-6.8.2c-.4.1-1.3.1-2 .9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.8.8 2.2.9 1.6.2 6.6.2 6.6.2s4 0 6.8-.2c.4-.1 1.3-.1 2-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM10.1 14.5V8.3l5.2 3.1-5.2 3.1Z" />
        </svg>
      );
  }
}

export function Footer() {
  const [message, setMessage] = useState("");

  function handleNewsletterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Merci ! La connexion newsletter sera activée prochainement.");
  }

  return (
    <footer className="relative overflow-hidden border-t border-emerald-900 bg-[radial-gradient(circle_at_75%_85%,rgba(132,204,22,0.22),transparent_28%),linear-gradient(135deg,#052e1f_0%,#073b29_45%,#052e1f_100%)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.95fr_1.45fr] lg:gap-12 lg:px-8 lg:py-20">
        <div>
          <div className="flex items-center gap-3 text-2xl font-bold">
            <Image
              src="/images/brand/Untitled-1.png"
              alt="Logo Agri-tech"
              width={48}
              height={36}
              className="h-10 w-auto object-contain"
            />
            {footerBrand.name}
          </div>
          <p className="mt-6 max-w-sm text-base leading-7 text-white/75">{footerBrand.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {footerSocialLinks.map((social) => (
              <a key={social.label} href={social.href} aria-label={social.label} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/85 ring-1 ring-white/10 transition hover:bg-lime-400 hover:text-emerald-950 focus:outline-none focus:ring-2 focus:ring-lime-300">
                <SocialIcon name={social.icon} />
              </a>
            ))}
          </div>
        </div>

        <FooterList title="Explorer" items={footerExplorerLinks} />

        <div>
          <h3 className="text-lg font-bold text-white">Contact</h3>
          <ul className="mt-6 space-y-4 text-base text-white/75">
            <li className="flex items-center gap-3"><MapPin className="h-4 w-4 shrink-0 text-lime-200" aria-hidden="true" />{footerContact.location}</li>
            <li><a href={footerContact.phoneHref} className="flex items-center gap-3 transition hover:text-lime-200"><Phone className="h-4 w-4 shrink-0 text-lime-200" aria-hidden="true" />{footerContact.phone}</a></li>
            <li><a href={footerContact.emailHref} className="flex items-center gap-3 break-all transition hover:text-lime-200"><Mail className="h-4 w-4 shrink-0 text-lime-200" aria-hidden="true" />{footerContact.email}</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{footerNewsletter.title}</h3>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/75">{footerNewsletter.description}</p>
          <form className="mt-7 flex w-full flex-col gap-3 sm:flex-row lg:max-w-lg" onSubmit={handleNewsletterSubmit}>
            <label className="sr-only" htmlFor="footer-newsletter-email">{footerNewsletter.placeholder}</label>
            <input id="footer-newsletter-email" name="email" type="email" required placeholder={footerNewsletter.placeholder} className="min-h-14 w-full min-w-0 rounded-xl border border-white/10 bg-white px-5 text-base text-emerald-950 outline-none transition placeholder:text-slate-500 focus:border-lime-300 focus:ring-2 focus:ring-lime-300/60 sm:flex-1" />
            <button type="submit" className="min-h-14 rounded-full border border-white/15 px-7 text-base font-bold text-white transition hover:bg-lime-400 hover:text-emerald-950 focus:outline-none focus:ring-2 focus:ring-lime-300 sm:w-auto">{footerNewsletter.buttonLabel}</button>
          </form>
          {message ? <p className="mt-3 text-sm text-lime-100" role="status">{message}</p> : null}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <nav aria-label="Liens légaux" className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-start">
            {footerLegalLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-lime-200">
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-center md:text-right">© 2026 Agri-tech — Tous droits réservés</p>
        </div>
      </div>
    </footer>
  );
}

function FooterList({ title, items }: { title: string; items: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <ul className="mt-6 space-y-3 text-base text-white/75">
        {items.map((item) => <li key={item.href}><Link href={item.href} className="transition hover:text-lime-200">{item.label}</Link></li>)}
      </ul>
    </div>
  );
}
