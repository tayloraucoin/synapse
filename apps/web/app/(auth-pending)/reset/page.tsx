import { AuthFrame } from "@syn/ui";

import { AUTH_COPY } from "@/app/(auth)/_components/copy";

import { ResetForm } from "./_components/reset-form";

/** AU-05 Reset password. The recovery session is guaranteed by the layout. */
export default function ResetPage() {
  return (
    <AuthFrame heading={AUTH_COPY.reset.heading}>
      <ResetForm />
    </AuthFrame>
  );
}
