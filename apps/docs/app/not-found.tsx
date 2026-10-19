import Link from "next/link";
import { buttonVariants } from "@syn/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">No document here</h1>
      <p className="text-docs-muted">
        Every page in this app is a markdown file under <code>docs/</code> or{" "}
        <code>specs/</code>.
      </p>
      <Link href="/" className={buttonVariants({ variant: "secondary" })}>
        Back to the index
      </Link>
    </div>
  );
}
