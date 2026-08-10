import React from "react";
import { Sparkles } from "lucide-react";

/**
 * ComingSoonTab
 * Generic placeholder for tabs you'll build out later.
 *
 * Props:
 * - title (string)
 * - description (string)
 */
export default function ComingSoonTab({ title = "Coming soon", description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 rounded-2xl border border-dashed border-base-300 bg-base-100">
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
        <Sparkles size={20} />
      </span>
      <p className="text-sm font-semibold text-base-content/70">{title}</p>
      {description && (
        <p className="text-xs text-base-content/40 mt-1 max-w-sm">
          {description}
        </p>
      )}
    </div>
  );
}
