"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { testimonials } from "@/data/testimonials";
import type { Locale } from "@/i18n";
import { publicContent } from "@/i18n/public-content";

const AUTOPLAY_DELAY = 6000;

export function HomeTestimonialsSection({
  locale = "fr",
}: {
  locale?: Locale;
}) {
  const content = publicContent[locale].testimonials;
  const localizedTestimonials = testimonials.map((item, index) => {
    if (locale === "fr") return item;
    const en = [
      [
        "Project owner",
        "Broiler farming",
        "Agri-tech helped me structure my idea and identify the mistakes to avoid before investing.",
      ],
      [
        "Supported producer",
        "Rabbit farming",
        "The training helped me better understand feeding, hygiene and the organization of a profitable small farm.",
      ],
      [
        "Organization manager",
        "Agricultural training",
        "Agri-tech’s approach is clear, practical and adapted to field realities. It makes decision-making easier.",
      ],
    ];
    const es = [
      [
        "Promotor de proyecto",
        "Pollos de engorde",
        "Agri-tech me ayudó a estructurar mi idea y detectar los errores que debía evitar antes de invertir.",
      ],
      [
        "Productora acompañada",
        "Cunicultura",
        "La formación me permitió comprender mejor la alimentación, la higiene y la organización de una pequeña granja rentable.",
      ],
      [
        "Responsable de organización",
        "Formación agrícola",
        "El enfoque de Agri-tech es claro, práctico y adaptado a la realidad del terreno. Facilita la toma de decisiones.",
      ],
    ];
    const [profile, domain, quote] = (locale === "en" ? en : es)[index];
    return { ...item, profile, domain, quote };
  });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = window.setInterval(() => {
      setActiveIndex(
        (currentIndex) => (currentIndex + 1) % testimonials.length,
      );
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setActiveIndex(
      (currentIndex) =>
        (currentIndex - 1 + localizedTestimonials.length) %
        localizedTestimonials.length,
    );
  };

  const goToNext = () => {
    setActiveIndex(
      (currentIndex) => (currentIndex + 1) % localizedTestimonials.length,
    );
  };

  return (
    <Section className="bg-transparent py-10 sm:py-14 lg:py-16">
      <SectionHeader
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      <div className="mx-auto mt-8 max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white/95 px-5 py-7 text-center shadow-sm ring-1 ring-white/70 sm:px-12 sm:py-8 lg:px-18">
          <button
            type="button"
            aria-label={content.previous}
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100 bg-white/85 text-xl leading-none text-emerald-900 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 sm:flex"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label={content.next}
            onClick={goToNext}
            className="absolute right-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100 bg-white/85 text-xl leading-none text-emerald-900 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 sm:flex"
          >
            ›
          </button>

          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {localizedTestimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="flex min-w-full justify-center px-1"
                >
                  <div className="flex max-w-2xl flex-col items-center">
                    <div className="relative size-20 overflow-hidden rounded-full border-4 border-white bg-emerald-50 shadow-md sm:size-24">
                      <Image
                        src={testimonial.imageSrc}
                        alt={testimonial.imageAlt}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    <h2 className="mt-4 text-lg font-bold text-emerald-950 sm:text-xl">
                      {testimonial.profile}
                    </h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {testimonial.domain}
                    </p>

                    <div
                      className="mt-3 flex items-center justify-center gap-1"
                      aria-label={`${testimonial.rating} étoiles sur 5`}
                    >
                      {Array.from({ length: testimonial.rating }).map(
                        (_, index) => (
                          <span
                            key={index}
                            aria-hidden="true"
                            className="text-lg text-amber-400"
                          >
                            ★
                          </span>
                        ),
                      )}
                    </div>

                    <blockquote className="mt-4 text-base font-medium leading-7 text-slate-700 sm:text-lg sm:leading-8">
                      “{testimonial.quote}”
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2 sm:hidden">
            <button
              type="button"
              aria-label={content.previous}
              onClick={goToPrevious}
              className="flex size-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-xl leading-none text-emerald-900 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={content.next}
              onClick={goToNext}
              className="flex size-9 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-xl leading-none text-emerald-900 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              ›
            </button>
          </div>
        </div>

        <div
          className="mt-4 flex items-center justify-center gap-1.5"
          aria-label="Pagination des témoignages"
        >
          {localizedTestimonials.map((testimonial, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={testimonial.id}
                type="button"
                aria-label={`Afficher le témoignage ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={`size-2 rounded-full transition focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 ${
                  isActive
                    ? "bg-emerald-900"
                    : "bg-emerald-200 hover:bg-emerald-300"
                }`}
              />
            );
          })}
        </div>
      </div>
    </Section>
  );
}
