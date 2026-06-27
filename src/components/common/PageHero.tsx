import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

export function PageHero({ eyebrow, title, description, primaryCta, secondaryCta }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-emerald-950 py-16 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(249,115,22,0.35),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(34,197,94,0.28),transparent_30%),linear-gradient(135deg,rgba(6,78,59,0.98),rgba(2,44,34,0.96))]" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f8faf7] to-transparent" />
      <Container className="relative">
        <div className="max-w-3xl">
          <Badge tone="orange" className="bg-orange-200 text-orange-950 ring-orange-300">{eyebrow}</Badge>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-6 text-lg leading-8 text-emerald-50">{description}</p>
          {(primaryCta || secondaryCta) ? (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {primaryCta ? <Button href={primaryCta.href} variant="secondary" size="lg">{primaryCta.label}</Button> : null}
              {secondaryCta ? <Button href={secondaryCta.href} variant="outline" size="lg" className="border-white/70 text-white hover:bg-white/10">{secondaryCta.label}</Button> : null}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
