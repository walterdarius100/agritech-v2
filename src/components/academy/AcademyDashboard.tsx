import { CourseCard } from "@/components/academy/CourseCard";
import { CourseProgressCard } from "@/components/academy/CourseProgressCard";
import { Container } from "@/components/ui/Container";
import { academyCourses } from "@/data/academyCourses";

// Statistiques temporaires du prototype, sans progression sauvegardée.
const prototypeStats = [
  { label: "Formations accessibles", value: "3", helper: "Accès fictif pour la maquette" },
  { label: "Modules disponibles", value: "18", helper: "Volume indicatif du prototype" },
  { label: "Progression moyenne", value: "42 %", helper: "Donnée non sauvegardée" },
];


export function AcademyDashboard() {
  return (
    <main className="overflow-x-hidden bg-[#f8faf7]">
      <section className="relative overflow-hidden bg-emerald-950 py-14 text-white sm:py-16 lg:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(249,115,22,0.22),transparent_26%),radial-gradient(circle_at_86%_15%,rgba(34,197,94,0.2),transparent_28%)]" />
        <Container className="relative">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-yellow-400">
              AGRI-TECH ACADEMY
            </p>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
              Bienvenue dans votre espace étudiant.
            </h1>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Retrouvez ici vos formations, vos modules, vos ressources pédagogiques et votre progression d’apprentissage.
            </p>
            <p className="mt-5 w-fit rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 ring-1 ring-white/15">
              Prototype visuel — l’accès réel sera activé après inscription et validation.
            </p>
          </div>
        </Container>
      </section>

      <Container className="py-12 sm:py-14 lg:py-16">
        <div className="rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm leading-6 text-orange-900">
          Prototype visuel — les accès, paiements et progressions réelles seront ajoutés dans une prochaine étape.
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3" aria-label="Résumé de progression fictive">
          {prototypeStats.map((stat) => (
            <CourseProgressCard key={stat.label} {...stat} />
          ))}
        </section>

        <section className="mt-12">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">
              Formations accessibles
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-4xl">
              Vos parcours Agri-tech Academy
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              Ces cartes présentent l’interface cible de l’espace étudiant. Les accès réels seront connectés aux inscriptions dans une étape ultérieure.
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {academyCourses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
