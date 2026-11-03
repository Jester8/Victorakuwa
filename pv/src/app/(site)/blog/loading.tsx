/** Shown instantly while the blog list loads. Mirrors the real layout so nothing jumps. */
export default function BlogLoading() {
  return (
    <div aria-busy="true" aria-label="Loading articles">
      <section className="container-px pb-12 pt-16 sm:pb-16 sm:pt-24 lg:pt-28">
        <div className="skeleton h-3 w-28 rounded-full" />
        <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="w-full max-w-3xl space-y-3">
            <div className="skeleton h-12 w-4/5 rounded-xl sm:h-16" />
            <div className="skeleton h-12 w-3/5 rounded-xl sm:h-16" />
          </div>
          <div className="w-full max-w-sm space-y-2.5">
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-4 w-2/3 rounded-full" />
          </div>
        </div>
      </section>

      <section className="container-px pb-14 sm:pb-20">
        <div className="grid gap-7 rounded-3xl border border-line p-3 sm:p-5 md:grid-cols-[1.12fr_0.88fr] md:items-center md:gap-10 lg:p-6">
          <div className="skeleton aspect-[16/10] rounded-2xl sm:rounded-[1.75rem]" />
          <div className="space-y-4 px-3 pb-4 sm:px-4 md:px-2">
            <div className="skeleton h-3.5 w-40 rounded-full" />
            <div className="skeleton h-9 w-full rounded-lg" />
            <div className="skeleton h-9 w-3/4 rounded-lg" />
            <div className="space-y-2 pt-2">
              <div className="skeleton h-4 w-full rounded-full" />
              <div className="skeleton h-4 w-5/6 rounded-full" />
            </div>
            <div className="skeleton mt-4 h-11 w-40 rounded-full" />
          </div>
        </div>
      </section>

      <section className="container-px pb-24 sm:pb-32">
        <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <div className="skeleton aspect-[5/3] rounded-xl" />
              <div className="space-y-3 pt-5">
                <div className="skeleton h-3 w-32 rounded-full" />
                <div className="skeleton h-6 w-11/12 rounded-lg" />
                <div className="skeleton h-4 w-full rounded-full" />
                <div className="skeleton h-4 w-2/3 rounded-full" />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
