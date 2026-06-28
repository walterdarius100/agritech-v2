"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { testimonials } from "@/data/testimonials";

const AUTOPLAY_DELAY = 6000;

export function HomeTestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % testimonials.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [activeIndex]);

  const activeTestimonial = testimonials[activeIndex];

  const goToPrevious = () => {
    setActiveIndex((currentIndex) => (currentIndex - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) => (currentIndex + 1) % testimonials.length);
  };

  return (
    <Section className="bg-[#fbf6ea]">
      <SectionHeader
        eyebrow="Témoignages"
        title="Ce que disent les personnes accompagnées."
        description="Des retours qui reflètent la qualité de notre accompagnement."
      />

      <div className="mx-auto mt-10 max-w-4xl">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white px-6 py-10 text-center shadow-sm ring-1 ring-white/70 sm:px-12 lg:px-20">
          <button
            type="button"
            aria-label="Témoignage précédent"
            onClick={goToPrevious}
            className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100 bg-white/85 text-3xl leading-none text-emerald-900 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 sm:flex"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Témoignage suivant"
            onClick={goToNext}
            className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100 bg-white/85 text-3xl leading-none text-emerald-900 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 sm:flex"
          >
            ›
          </button>

          <div key={activeTestimonial.id} className="mx-auto flex max-w-2xl animate-[testimonial-fade-in_350ms_ease-out] flex-col items-center">
            <div className="relative size-24 overflow-hidden rounded-full border-4 border-white bg-emerald-50 shadow-md sm:size-28">
              <Image
                src={activeTestimonial.imageSrc}
                alt={activeTestimonial.imageAlt}
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>

            <h2 className="mt-6 text-xl font-bold text-emerald-950">{activeTestimonial.profile}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{activeTestimonial.domain}</p>

            <div className="mt-4 flex items-center justify-center gap-1" aria-label={`${activeTestimonial.rating} étoiles sur 5`}>
              {Array.from({ length: activeTestimonial.rating }).map((_, index) => (
                <span key={index} aria-hidden="true" className="text-xl text-amber-400">
                  ★
                </span>
              ))}
            </div>

            <blockquote className="mt-6 text-lg font-medium leading-8 text-slate-700 sm:text-xl sm:leading-9">
              “{activeTestimonial.quote}”
            </blockquote>
          </div>

          <div className="mt-8 flex justify-center gap-3 sm:hidden">
            <button
              type="button"
              aria-label="Témoignage précédent"
              onClick={goToPrevious}
              className="flex size-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-2xl leading-none text-emerald-900 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Témoignage suivant"
              onClick={goToNext}
              className="flex size-10 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-2xl leading-none text-emerald-900 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
            >
              ›
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination des témoignages">
          {testimonials.map((testimonial, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={testimonial.id}
                type="button"
                aria-label={`Afficher le témoignage ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={`size-3 rounded-full transition focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 ${
                  isActive ? "bg-emerald-900" : "bg-emerald-200 hover:bg-emerald-300"
                }`}
              />
            );
          })}
        </div>
      </div>
    </Section>
  );
}
