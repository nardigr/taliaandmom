import Link from "next/link";
import { t } from "@/lib/i18n/sq";
import type { ContactSettings } from "@/lib/settings";
import { Wordmark } from "@/components/layout/Wordmark";

type FooterProps = {
  contact: ContactSettings;
  tagline: string;
  collections: { slug: string; label: string }[];
};

export function Footer({ contact, tagline, collections }: FooterProps) {
  const year = new Date().getFullYear();
  const whatsappHref = `https://wa.me/${contact.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <footer className="mt-auto bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Wordmark className="text-2xl" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-choco-soft">
              {tagline}
            </p>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] text-choco-soft">
              {t.koleksioni}
            </h2>
            <ul className="mt-4 space-y-2">
              {collections.map((season) => (
                <li key={season.slug}>
                  <FooterLink href={`/koleksioni/${season.slug}`}>
                    {season.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] text-choco-soft">
              {t.informacion}
            </h2>
            <ul className="mt-4 space-y-2">
              <li>
                <FooterLink href="/rreth-nesh">{t.rrethNesh}</FooterLink>
              </li>
              <li>
                <FooterLink href="/kontakt">{t.kontakt}</FooterLink>
              </li>
              <li>
                <FooterLink href="/politika-e-kthimit">
                  {t.politikaKthimit}
                </FooterLink>
              </li>
              <li>
                <FooterLink href="/kushtet-e-perdorimit">
                  {t.kushtetPerdorimit}
                </FooterLink>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.25em] text-choco-soft">
              {t.kontakt}
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-ink">
              <li>{contact.contactAddress}</li>
              <li>
                <a
                  href={`tel:${contact.contactPhone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-choco"
                >
                  {contact.contactPhone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${contact.contactEmail}`}
                  className="transition-colors hover:text-choco"
                >
                  {contact.contactEmail}
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              {contact.instagramUrl !== "#" ? (
                <SocialLink href={contact.instagramUrl} label="Instagram">
                  <InstagramIcon />
                </SocialLink>
              ) : null}
              {contact.facebookUrl !== "#" ? (
                <SocialLink href={contact.facebookUrl} label="Facebook">
                  <FacebookIcon />
                </SocialLink>
              ) : null}
              <SocialLink href={whatsappHref} label="WhatsApp">
                <WhatsAppIcon />
              </SocialLink>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-beige pt-8 text-center text-sm text-choco-soft">
          © {year} Talja&mom. {t.teDrejtat}
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-sm text-ink transition-colors hover:text-choco"
    >
      {children}
    </Link>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="text-choco transition-colors hover:text-choco-soft"
    >
      {children}
    </a>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v2H6v4h3v8h4v-8h3l1-4h-4V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.883 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
