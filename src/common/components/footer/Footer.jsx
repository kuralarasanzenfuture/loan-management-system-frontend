// import React from "react";
// import { Heart } from "lucide-react";

// /**
//  * Footer
//  * Sits at the bottom of the main content area (not the sidebar). Stacks
//  * on mobile, sits inline on larger screens. Uses the same base-content/
//  * base-300 tokens as Header/Pagination so it matches light and dark themes
//  * automatically.
//  */
// export default function Footer() {
//   const year = new Date().getFullYear();

//   return (
//     <footer className="w-full border-t border-base-300 bg-base-100/60 backdrop-blur-sm">
//       <div className="max-w-full px-4 lg:px-6 py-4">
//         <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-4 text-center sm:text-left">
//           {/* Copyright */}
//           <p className="text-[11px] sm:text-xs text-base-content/40 font-medium leading-relaxed">
//             © {year}{" "}
//             <span className="font-semibold text-base-content/60">Varuvi</span>.
//             All rights reserved.
//           </p>

//           {/* Designed by */}
//           <p className="flex items-center gap-1.5 text-[11px] sm:text-xs text-base-content/40 font-medium">
//             <span className="hidden sm:inline">Designed with</span>
//             <Heart size={11} className="text-error/60 fill-error/60 shrink-0" />
//             <span className="hidden sm:inline">by</span>
//             <a
//               href="https://www.zenfuture.in/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="font-semibold text-primary hover:text-primary/70 hover:underline underline-offset-2 transition-colors"
//             >
//               ZenFuture
//             </a>
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }

import React from "react";
import { Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full shrink-0 border-t border-base-300 bg-base-100/70 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-3 sm:px-5 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row sm:gap-4">
          {/* Copyright */}
          <p className="text-center text-[11px] font-medium leading-relaxed text-base-content/40 sm:text-left sm:text-xs">
            © {year}{" "}
            <span className="font-semibold text-base-content/60">Varuvi</span>.
            All rights reserved.
          </p>

          {/* Designed by */}
          <p className="flex items-center gap-1.5 text-[11px] font-medium text-base-content/40 sm:text-xs">
            <span className="hidden sm:inline">Designed with</span>

            <Heart size={11} className="shrink-0 fill-error/60 text-error/60" />

            <span className="hidden sm:inline">by</span>

            <a
              href="https://www.zenfuture.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary transition-colors hover:text-primary/70 hover:underline hover:underline-offset-2"
            >
              ZenFuture
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
