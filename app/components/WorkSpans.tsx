const disciplines = ["Interior Design", "Architecture", "Permits & Drawings"];

const statement =
  "We reimagine the built environment, creating spaces that provoke thought, inspire creativity, and build deep connections between people and their surroundings.";

export function WorkSpans({ images }: { images: string[] }) {
  const words = statement.split(" ");
  // Last word finishes at 75% of the pin (60% start + 15% fade), so the full
  // sentence sits fully black for a beat before the section unpins.
  const step = `${60 / (words.length - 1)}%`;

  return (
    <section id="studio">
      <div className="wordfill-scope relative h-[240vh]">
        <div className="sticky top-0 flex h-screen items-center">
          <div className="mx-auto grid w-full max-w-[1600px] items-start gap-10 px-6 md:grid-cols-12 md:px-10">
            <div className="md:col-span-3">
              <p className="text-xs uppercase tracking-[0.3em] text-clay">
                Salman Ellahi
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-umber/60">
                Founder &amp; Principal Designer
              </p>
            </div>
            <h2
              className="font-grotesk md:col-span-8 md:col-start-5 text-3xl font-normal leading-[1.15] tracking-[-0.01em] text-ink md:text-5xl lg:text-6xl"
              style={{ "--step": step } as React.CSSProperties}
            >
              {words.map((word, i) => (
                <span
                  key={i}
                  className="wordfill"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {word}{" "}
                </span>
              ))}
            </h2>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 pb-24 md:px-10 md:pb-32">
      <p className="mb-10 font-grotesk text-xl text-ink">
        Our work spans
      </p>

      {/* Expanding gallery: equal by default; hovered item grows, others stay equal. */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start [&:has(a:hover)_a:not(:hover)_h3]:opacity-0">
        {disciplines.map((d, i) => (
            <a
              key={d}
              href="#projects"
              className="flex flex-col md:min-w-0 md:flex-1 md:basis-0 md:transition-[flex-grow] md:duration-500 md:ease-out md:hover:grow-[2.5]"
            >
              {/* ponytail: background-image (not next/image) so widening the fixed-height
                  box reveals more of the picture at constant scale — expand, no zoom.
                  Landscape source keeps the widened box covered. */}
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-md bg-espresso bg-cover bg-center md:aspect-auto md:h-[62vh] md:bg-[length:auto_100%]"
                style={{ backgroundImage: `url("${images[i % images.length]}")` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/40 to-transparent" />
              </div>
              <h3 className="font-grotesk mt-4 flex items-center gap-2 text-2xl text-ink transition-opacity duration-500 ease-out md:text-3xl">
                {d}
                <span className="text-clay">→</span>
              </h3>
            </a>
        ))}
      </div>
      </div>
    </section>
  );
}
