const items = [
  "Pastor Victor Akuwa",
  "Teacher",
  "Author",
  "Mentor",
  "Lead Pastor, The Prevailing House",
  "Information Scientist",
  "Husband & Father",
  "Raising sons in the faith",
];

function Track({ hidden = false }: { hidden?: boolean }) {
  return (
    <ul className="marquee-track" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <li key={item} className="marquee-item">
          <span className={i % 2 === 0 ? "marquee-solid" : "marquee-outline"}>
            {item}
          </span>
          <span className="marquee-dot" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
}

export default function Marquee() {
  return (
    <section
      aria-label="Highlights"
      className="marquee border-b border-line bg-background py-7 sm:py-9"
    >
      <div className="marquee-inner">
        <Track />
        <Track hidden />
      </div>
    </section>
  );
}
