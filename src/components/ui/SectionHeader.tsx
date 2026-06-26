type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-600">{eyebrow}</p> : null}
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-emerald-950 sm:text-5xl">{title}</h1>
      {description ? <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">{description}</p> : null}
    </div>
  );
}
