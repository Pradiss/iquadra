import type { Feedback } from "@/components/admin/admin-helpers";

export function AdminFeedback({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;

  const color =
    feedback.type === "success"
      ? "bg-lime-50 text-lime-800"
      : "bg-red-50 text-red-700";

  return (
    <p className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${color}`}>
      {feedback.message}
    </p>
  );
}