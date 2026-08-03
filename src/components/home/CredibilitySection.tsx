import { Section } from "@/components/ui/Section";
import type { Locale } from "@/i18n";
import { publicContent } from "@/i18n/public-content";

export function CredibilitySection({ locale = "fr" }: { locale?: Locale }) {
  const content = publicContent[locale].method;
  return (
    <Section className="bg-transparent py-12 sm:py-16 lg:py-18">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-emerald-950 sm:text-5xl">
            {content.title}
          </h2>
          <p className="mt-5 leading-7 text-slate-600">{content.description}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {content.steps.map((step, index) => (
            <div
              key={step}
              className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6"
            >
              <span className="text-sm font-bold text-orange-600">
                0{index + 1}
              </span>
              <h3 className="mt-3 font-bold text-emerald-950">{step}</h3>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
