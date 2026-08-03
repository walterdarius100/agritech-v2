import type { Article } from "@/types/article";
import type { Locale } from "@/i18n/locales";

type EditorialTranslation = Pick<
  Article,
  "title" | "category" | "excerpt" | "content"
>;

const translations: Record<
  "en" | "es",
  Record<string, EditorialTranslation>
> = {
  en: {
    "article-a-la-une": {
      title: "Why prepare an agricultural project carefully before investing?",
      category: "Agricultural analysis",
      excerpt:
        "Before building a poultry house, launching a farm or buying equipment, a sound study reduces mistakes, improves cost estimates and adapts the project to the site.",
      content:
        "A solid agricultural project starts with an assessment of the land, available water, budget, market and required skills. This preparation helps select the right technical model, anticipate costs and avoid rushed decisions that undermine profitability.",
    },
    "erreurs-demarrage-elevage-poulet-chair": {
      title: "Broilers: common mistakes when starting a farm",
      category: "Poultry farming",
      excerpt:
        "Temperature, stocking density, feeding and hygiene: the first days strongly influence growth, health and the economic outcome of a flock.",
      content:
        "Starting a broiler farm requires careful preparation of the building, litter, water points and feeding program. Daily observation makes it possible to correct issues quickly and limit losses.",
    },
    "cuniculture-alimentation-rentabilite": {
      title: "Rabbit farming: why feeding directly affects profitability",
      category: "Rabbit farming",
      excerpt:
        "A consistent, balanced diet adapted to the production stage reduces losses and improves rabbit-farm performance.",
      content:
        "In rabbit farming, nutrition influences growth, reproduction and digestive health. Monitoring feed quantities, forage quality and available water is essential to stabilize profitability.",
    },
    "apiculture-causes-depart-colonie": {
      title: "Beekeeping: understanding why a colony leaves",
      category: "Beekeeping",
      excerpt:
        "Insufficient food, a poor location, excessive heat or repeated disturbance can cause a colony to leave its hive.",
      content:
        "A colony does not always leave by chance. Beekeepers should assess the environment, floral resources, shade, ventilation and handling practices to create more stable conditions for the bees.",
    },
  },
  es: {
    "article-a-la-une": {
      title: "¿Por qué preparar bien un proyecto agrícola antes de invertir?",
      category: "Análisis agrícola",
      excerpt:
        "Antes de construir un gallinero, iniciar una granja o comprar equipos, un estudio serio reduce errores, mejora la estimación de costes y adapta el proyecto al terreno.",
      content:
        "Un proyecto agrícola sólido comienza con un análisis del terreno, el agua disponible, el presupuesto, el mercado y las competencias necesarias. Esta preparación ayuda a elegir el modelo técnico adecuado, anticipar los gastos y evitar decisiones precipitadas que debiliten la rentabilidad.",
    },
    "erreurs-demarrage-elevage-poulet-chair": {
      title: "Pollos de engorde: errores frecuentes al iniciar una granja",
      category: "Avicultura",
      excerpt:
        "Temperatura, densidad, alimentación e higiene: los primeros días influyen mucho en el crecimiento, la salud y los resultados económicos del lote.",
      content:
        "Iniciar una granja de pollos de engorde exige preparar cuidadosamente el edificio, la cama, los puntos de agua y el programa alimentario. La observación diaria permite corregir problemas con rapidez y limitar las pérdidas.",
    },
    "cuniculture-alimentation-rentabilite": {
      title:
        "Cunicultura: por qué la alimentación afecta directamente la rentabilidad",
      category: "Cunicultura",
      excerpt:
        "Una dieta regular, equilibrada y adaptada a la etapa productiva reduce pérdidas y mejora el rendimiento de las granjas de conejos.",
      content:
        "En cunicultura, la alimentación influye en el crecimiento, la reproducción y la salud digestiva. Controlar las cantidades, la calidad del forraje y el agua disponible es esencial para estabilizar la rentabilidad.",
    },
    "apiculture-causes-depart-colonie": {
      title: "Apicultura: comprender por qué una colonia abandona la colmena",
      category: "Apicultura",
      excerpt:
        "La falta de alimento, una ubicación inadecuada, el calor excesivo o las molestias repetidas pueden hacer que una colonia abandone la colmena.",
      content:
        "La salida de una colonia no siempre es casual. El apicultor debe observar el entorno, los recursos florales, la sombra, la ventilación y las manipulaciones para crear condiciones más estables para las abejas.",
    },
  },
};

/** Editorial translations are applied when available; Supabase-only content safely falls back to French. */
export function localizeArticle(article: Article, locale: Locale): Article {
  if (locale === "fr") return article;
  const translation = translations[locale][article.slug];
  return translation
    ? {
        ...article,
        ...translation,
        reading_time: locale === "en" ? "3 min read" : "3 min de lectura",
        author: locale === "en" ? "Agri-tech team" : "Equipo Agri-tech",
      }
    : article;
}
