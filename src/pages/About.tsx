export function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <p className="text-sm uppercase tracking-[0.3em] text-brass">Our story</p>
      <h1 className="mt-3 font-display text-5xl leading-tight text-plum">
        Two friends, one shared eye for detail.
      </h1>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/80">
        <p>
          RnD Muse began with <strong>Ronit</strong> and <strong>Dhruv</strong> — the
          R and the D — hunting for accessories that felt both rooted and modern, and
          rarely finding them in one place.
        </p>
        <p>
          So they built it. A collection where a hand-set kundan earring sits happily
          next to a minimal everyday hoop, and a festive potli shares a shelf with a
          work-ready tote. Ethnic × modern, for every age and every mood.
        </p>
        <p>
          Everything is chosen by hand, priced to be within reach, and shipped across
          India with care.
        </p>
      </div>

      {/* Team — swap placeholders for real photos in /public */}
      <div className="mt-14 grid gap-8 sm:grid-cols-2">
        {[
          { name: "Ronit", role: "Co-founder · Product & sourcing" },
          { name: "Dhruv", role: "Co-founder · Brand & operations" },
        ].map((m) => (
          <div key={m.name} className="rounded-xl2 bg-white p-6 text-center shadow-soft">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-plum text-3xl font-display text-brassLite">
              {m.name[0]}
            </div>
            <h3 className="mt-4 text-xl text-plum">{m.name}</h3>
            <p className="mt-1 text-sm text-plum/60">{m.role}</p>
          </div>
        ))}
      </div>

      <div className="mt-14 rounded-xl2 bg-plum p-8 text-center text-ivory">
        <p className="font-display text-2xl italic text-brassLite">"Adorn your every mood."</p>
        <p className="mt-2 text-sm text-ivory/70">— The RnD Muse promise</p>
      </div>
    </div>
  );
}
