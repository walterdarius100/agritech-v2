import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Leaf,
  MessageCircle,
  PhoneCall,
  Sprout,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { createMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = createMetadata({
  title: "Réserver une consultation agricole",
  description:
    "Réservez une consultation agricole avec Agri-tech pour présenter votre projet, identifier les risques et recevoir des recommandations adaptées.",
  path: "/consultation",
});

const consultationBenefits = [
  "Analyse de votre besoin",
  "Identification des erreurs ou risques",
  "Recommandations adaptées",
  "Orientation technique selon votre projet",
  "Conseils sur les prochaines étapes",
];

const coveredDomains = [
  "Aviculture",
  "Apiculture",
  "Cuniculture",
  "Pisciculture",
  "Maraîchage",
  "Irrigation",
  "Projet agricole général",
];

const steps = [
  {
    title: "Remplissez le formulaire",
    description:
      "Présentez votre projet, votre commune, votre besoin et le domaine agricole concerné.",
    icon: ClipboardList,
  },
  {
    title: "Passez au paiement",
    description:
      "Le paiement confirme la soumission de votre demande de consultation Agri-tech.",
    icon: CreditCard,
  },
  {
    title: "Recevez une confirmation",
    description:
      "Vous obtenez un récapitulatif et un code de demande pour faciliter le suivi.",
    icon: CheckCircle2,
  },
  {
    title: "Agri-tech vous contacte",
    description:
      "L'équipe valide les informations et organise l’échange selon le mode le plus adapté.",
    icon: PhoneCall,
  },
];

export default function ConsultationPage() {
  return (
    <main className="bg-[#f8faf7] text-slate-900">
      <section className="overflow-hidden bg-emerald-950 text-white">
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="absolute -right-24 top-10 hidden h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl lg:block" />
          <div className="absolute -bottom-28 left-1/3 hidden h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl lg:block" />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">
                Consultation Agri-tech
              </p>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Réservez une consultation agricole avec Agri-tech
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/80">
                Présentez votre projet ou votre problème agricole, payez votre
                consultation en ligne et recevez un accompagnement adapté à
                votre situation.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button
                  href="/consultation/reserver"
                  size="lg"
                  className="bg-yellow-400 text-emerald-950 hover:bg-yellow-300 focus-visible:ring-yellow-400"
                >
                  Réserver une consultation
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  href="#domaines"
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 focus-visible:ring-white"
                >
                  Voir les domaines couverts
                </Button>
              </div>
            </div>

            <aside className="rounded-3xl bg-white p-6 text-slate-900 shadow-2xl shadow-emerald-950/30 ring-1 ring-white/20 sm:p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <MessageCircle className="h-7 w-7" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-emerald-950">
                Un échange pour clarifier avant d’investir.
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                La consultation aide à poser les bonnes questions, repérer les
                points de vigilance et organiser les prochaines étapes sans
                promettre de résultat financier garanti.
              </p>
              <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Tarif de départ
                </p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-950">
                  2 500 HTG
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Consultation en ligne de 30 à 45 minutes.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section
        className="py-14 sm:py-16 lg:py-20"
        aria-labelledby="contenu-consultation"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
                Ce que comprend la consultation
              </p>
              <h2
                id="contenu-consultation"
                className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl"
              >
                Un accompagnement clair pour avancer avec méthode
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Agri-tech vous aide à mieux comprendre votre situation agricole,
                vos contraintes locales et les décisions à prioriser avant de
                passer à l’action.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {consultationBenefits.map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-emerald-100"
                >
                  <CheckCircle2
                    className="h-6 w-6 text-emerald-700"
                    aria-hidden="true"
                  />
                  <p className="mt-4 font-semibold text-emerald-950">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section
        id="domaines"
        className="bg-white py-14 sm:py-16 lg:py-20"
        aria-labelledby="domaines-title"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Domaines couverts
            </p>
            <h2
              id="domaines-title"
              className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl"
            >
              Des conseils adaptés aux projets agricoles courants en Haïti
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Sélectionnez le domaine le plus proche de votre besoin. Si votre
              projet ne rentre pas dans une catégorie précise, choisissez projet
              agricole général.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coveredDomains.map((domain) => (
              <div
                key={domain}
                className="rounded-2xl border border-emerald-100 bg-[#f8faf7] p-5"
              >
                <Leaf className="h-6 w-6 text-emerald-700" aria-hidden="true" />
                <h3 className="mt-4 font-bold text-emerald-950">{domain}</h3>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section
        className="py-14 sm:py-16 lg:py-20"
        aria-labelledby="tarif-title"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="rounded-3xl bg-emerald-950 p-8 text-white shadow-xl sm:p-10">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
                Tarif de départ
              </p>
              <h2
                id="tarif-title"
                className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl"
              >
                Consultation agricole en ligne
              </h2>
              <p className="mt-5 text-lg text-white/80">30 à 45 minutes</p>
              <p className="mt-4 text-5xl font-extrabold text-yellow-400">
                2 500 HTG
              </p>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-emerald-100 sm:p-10">
              <Sprout
                className="h-10 w-10 text-emerald-700"
                aria-hidden="true"
              />
              <h3 className="mt-5 text-2xl font-bold text-emerald-950">
                Paiement et validation
              </h3>
              <p className="mt-4 leading-7 text-slate-600">
                Le paiement confirme la soumission de votre demande. Agri-tech
                vous contactera ensuite pour valider les informations et
                organiser l’échange.
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-500">
                Les recommandations restent adaptées aux informations fournies
                et au contexte du projet. Elles ne constituent pas une garantie
                de production, de rentabilité ou de résultat financier.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section
        className="bg-emerald-50 py-14 sm:py-16 lg:py-20"
        aria-labelledby="fonctionnement-title"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">
              Fonctionnement
            </p>
            <h2
              id="fonctionnement-title"
              className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl"
            >
              Un parcours simple avant l’échange avec Agri-tech
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.title}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-emerald-100"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-sm font-bold text-white">
                      {index + 1}
                    </span>
                    <Icon
                      className="h-7 w-7 text-emerald-700"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-emerald-950">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <Container>
          <div className="rounded-3xl bg-emerald-950 p-8 text-center text-white shadow-xl sm:p-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Prêt à présenter votre projet ?
            </p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
              Commencez votre réservation et partagez les informations
              essentielles avec Agri-tech.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-7 text-white/75">
              Votre demande sera examinée après paiement afin d’organiser un
              échange utile, réaliste et adapté à votre situation.
            </p>
            <Button
              href="/consultation/reserver"
              size="lg"
              className="mt-8 bg-yellow-400 text-emerald-950 hover:bg-yellow-300 focus-visible:ring-yellow-400"
            >
              Commencer ma réservation
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Container>
      </section>
    </main>
  );
}
