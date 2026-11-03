import { requireAdmin } from "@/lib/auth";
import { getActiveTheme, listThemeVersions } from "@/lib/theme";
import { DEFAULT_THEME, sameTheme } from "@/lib/theme-shared";
import { restoreThemeAction } from "@/app/admin/actions";
import ConfirmButton from "@/app/admin/ConfirmButton";
import ThemeEditor from "@/app/admin/theme/ThemeEditor";

function Swatches({ colors }: { colors: string[] }) {
  return (
    <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
      {colors.map((color, i) => (
        <span key={i} className="size-5 rounded-full border-2 border-background shadow-[0_0_0_1px_rgba(0,0,0,0.12)]" style={{ background: color }} />
      ))}
    </span>
  );
}

const when = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Lagos",
});

export default async function AdminTheme() {
  await requireAdmin();
  const [active, versions] = await Promise.all([getActiveTheme(), listThemeVersions()]);
  const isOriginal = sameTheme(active, DEFAULT_THEME);

  return (
    <div className="mx-auto max-w-[96rem]">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Theme</h1>
      <p className="mt-1 text-sm text-muted sm:text-base">
        Change the website&apos;s colours, fonts, animations and features. Only you can change this, and every published
        version is kept so you can go back.
      </p>

      <ThemeEditor active={active} />

      <section className="mt-8 rounded-2xl border border-line bg-background p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">History</h2>
            <p className="text-sm text-muted">Restore any earlier look. Restoring can be undone the same way.</p>
          </div>
          {!isOriginal && (
            <form action={restoreThemeAction}>
              <input type="hidden" name="original" value="true" />
              <ConfirmButton
                message="Put the website back to its original black and white look?"
                className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition-colors hover:border-foreground"
              >
                Reset to original
              </ConfirmButton>
            </form>
          )}
        </div>

        {versions.length === 0 ? (
          <p className="mt-4 text-sm text-muted">No changes yet. The site is using its original look.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {versions.map((version, i) => (
              <li key={version.id} className="flex flex-wrap items-center gap-3 py-3">
                <Swatches colors={[version.theme.background, version.theme.foreground, version.theme.accent]} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{version.label || "Theme update"}</p>
                  <p className="text-xs text-muted">{when.format(version.createdAt)}</p>
                </div>
                {i === 0 ? (
                  <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">Live</span>
                ) : (
                  <form action={restoreThemeAction}>
                    <input type="hidden" name="id" value={version.id} />
                    <ConfirmButton
                      message="Make this the website's theme again?"
                      className="rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold transition-colors hover:border-foreground"
                    >
                      Restore
                    </ConfirmButton>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
