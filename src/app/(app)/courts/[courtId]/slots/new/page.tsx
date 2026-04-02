import { redirect } from "next/navigation";
export default function OldNewSlotPage({
  params,
}: {
  params: { courtId: string };
}) {
  redirect(`/owner/courts/${params.courtId}/slots/new`);
}
