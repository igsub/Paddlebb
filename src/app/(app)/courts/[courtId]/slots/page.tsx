import { redirect } from "next/navigation";
export default function OldCourtSlotsPage({
  params,
}: {
  params: { courtId: string };
}) {
  redirect(`/owner/courts/${params.courtId}/slots`);
}
