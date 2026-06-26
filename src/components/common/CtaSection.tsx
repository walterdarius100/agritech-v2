import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export function CtaSection() {
  return (
    <Section className="bg-emerald-950 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-200">Consultation</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Discutons de votre projet agricole</h2>
        <p className="mt-4 text-emerald-50">Un échange permet de préciser votre objectif, votre terrain, votre budget et les étapes techniques prioritaires.</p>
        <Button href="/contact" variant="secondary" size="lg" className="mt-8">Demander une consultation</Button>
      </div>
    </Section>
  );
}
