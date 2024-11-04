import { ModeToggle } from "~/components/mode-toggle";

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid max-w-7xl grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
        <div>
          <h2 className="font-semibold leading-7">Theme mode</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Dummy text.
          </p>
        </div>
        <div className="md:col-span-2">
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
