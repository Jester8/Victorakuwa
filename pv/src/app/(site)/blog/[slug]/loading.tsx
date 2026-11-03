/** Shown instantly while a post loads. Mirrors the real layout so nothing jumps. */
export default function PostLoading() {
  return (
    <div aria-busy="true" aria-label="Loading article" className="pb-24 sm:pb-32">
      <div className="container-px pt-12 sm:pt-20">
        <div className="mx-auto max-w-[44rem]">
          <div className="skeleton h-4 w-24 rounded-full" />
          <div className="skeleton mt-10 h-4 w-44 rounded-full" />
          <div className="mt-5 space-y-3">
            <div className="skeleton h-10 w-full rounded-xl sm:h-12" />
            <div className="skeleton h-10 w-2/3 rounded-xl sm:h-12" />
          </div>
          <div className="mt-7 space-y-2.5">
            <div className="skeleton h-5 w-full rounded-full" />
            <div className="skeleton h-5 w-4/5 rounded-full" />
          </div>
          <div className="mt-8 border-t border-line pt-6">
            <div className="skeleton h-4 w-40 rounded-full" />
          </div>
        </div>
      </div>

      <div className="container-px mt-10 sm:mt-14">
        <div className="skeleton mx-auto aspect-[16/9] max-w-5xl rounded-2xl" />
      </div>

      <div className="container-px mt-12 sm:mt-16">
        <div className="mx-auto max-w-[44rem] space-y-3">
          {["w-full", "w-full", "w-11/12", "w-full", "w-3/4", "", "w-full", "w-full", "w-5/6"].map((width, i) =>
            width ? <div key={i} className={`skeleton h-4 rounded-full ${width}`} /> : <div key={i} className="h-4" />
          )}
        </div>
      </div>
    </div>
  );
}
