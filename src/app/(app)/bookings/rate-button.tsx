"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { submitRating } from "@/app/actions";

interface RateButtonProps {
  bookingId: string;
  complexId: string;
  complexName: string;
  existingScore?: number | null;
}

export function RateButton({
  bookingId,
  complexId,
  complexName,
  existingScore,
}: RateButtonProps) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(existingScore ?? 0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(!!existingScore);
  const [finalScore, setFinalScore] = useState(existingScore ?? 0);

  if (done) {
    return (
      <div className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`h-3.5 w-3.5 ${
              s <= finalScore
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  }

  async function handleSubmit() {
    if (selected === 0) return;
    setSubmitting(true);
    const result = await submitRating(bookingId, complexId, selected, comment);
    setSubmitting(false);
    if (result.error) {
      alert(result.error);
      return;
    }
    setFinalScore(selected);
    setDone(true);
    setOpen(false);
  }

  const activeStars = hovered || selected;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
      >
        ⭐ Calificar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 space-y-4 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Calificar complejo
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{complexName}</p>
            </div>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setSelected(s)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      s <= activeStars
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>

            {selected > 0 && (
              <p className="text-center text-sm font-medium text-gray-700">
                {["", "Muy malo", "Malo", "Regular", "Bueno", "Excelente"][selected]}
              </p>
            )}

            {/* Optional comment */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentario opcional..."
              rows={2}
              maxLength={300}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={selected === 0 || submitting}
                className="flex-1 h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold disabled:opacity-50 hover:bg-emerald-700 transition-colors"
              >
                {submitting ? "Guardando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
