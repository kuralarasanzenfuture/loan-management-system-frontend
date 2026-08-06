import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * buildPageNumbers
 * Always shows page 1 and last page.
 * Shows siblings around the active page with "..." gaps.
 *
 * Example — 20 pages, current = 7, siblings = 1:
 *   1  …  6  [7]  8  …  20
 *
 * Example — current = 2:
 *   [1]  [2]  3  …  20
 *
 * Example — current = 19:
 *   1  …  18  [19]  20
 */
function buildPageNumbers(currentPage, totalPages, siblings = 1) {
  const totalSlots = siblings * 2 + 5;
  if (totalPages <= totalSlots) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSiblingStart = Math.max(currentPage - siblings, 2);
  const rightSiblingEnd = Math.min(currentPage + siblings, totalPages - 1);

  const showLeftDots = leftSiblingStart > 2;
  const showRightDots = rightSiblingEnd < totalPages - 1;

  const pageList = [];

  pageList.push(1);

  if (showLeftDots) {
    pageList.push("left-dots");
  } else {
    for (let pageNum = 2; pageNum < leftSiblingStart; pageNum++) {
      pageList.push(pageNum);
    }
  }

  for (let pageNum = leftSiblingStart; pageNum <= rightSiblingEnd; pageNum++) {
    pageList.push(pageNum);
  }

  if (showRightDots) {
    pageList.push("right-dots");
  } else {
    for (let pageNum = rightSiblingEnd + 1; pageNum < totalPages; pageNum++) {
      pageList.push(pageNum);
    }
  }

  pageList.push(totalPages);

  return pageList;
}

/**
 * Pagination
 *
 * Props
 *   currentPage          number   1-based active page
 *   totalItems           number   total record count
 *   pageSize             number   rows per page          (default 10)
 *   pageSizeOptions      number[] rows-per-page choices  (default [5,10,20,50])
 *   siblings             number   pages on each side of current (default 1)
 *   onPageChange         fn(page: number)
 *   onPageSizeChange     fn(size: number)
 *   showPageSizeSelector bool     show the rows-per-page dropdown (default true)
 *   showFirstLast        bool     show ⏮ ⏭ jump buttons           (default true)
 */
export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  siblings = 1,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showFirstLast = true,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  const pageNumbers = buildPageNumbers(currentPage, totalPages, siblings);

  const goToPage = (targetPage) => {
    if (
      !onPageChange ||
      targetPage < 1 ||
      targetPage > totalPages ||
      targetPage === currentPage
    )
      return;
    onPageChange(targetPage);
  };

  const handlePageSizeChange = (event) => {
    const newSize = Number(event.target.value);
    onPageSizeChange?.(newSize);
    onPageChange?.(1);
  };

  if (totalItems === 0) return null;

  const navBtnClass =
    "w-8 h-8 rounded-lg flex items-center justify-center border border-base-300 bg-base-100 text-base-content/70 text-[13px] font-medium transition-colors hover:bg-base-200 hover:text-primary hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-base-100 disabled:hover:text-base-content/70 disabled:hover:border-base-300";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-base-300">
      {/* ── Left: summary + rows-per-page ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-[12.5px] text-base-content/50">
          Showing{" "}
          <span className="font-semibold text-base-content/80">
            {rangeStart}–{rangeEnd}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-base-content/80">
            {totalItems}
          </span>{" "}
          results
        </p>

        {showPageSizeSelector && (
          <div className="flex items-center gap-1.5">
            <span className="text-[12.5px] text-base-content/50">Rows:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="select select-bordered w-20 select-xs h-8 min-h-8 text-[12.5px] rounded-lg px-2.5 bg-base-100 border-base-300 text-base-content/80 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              {pageSizeOptions.map((sizeOption) => (
                <option key={sizeOption} value={sizeOption}>
                  {sizeOption}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Right: navigation ── */}
      <div className="flex items-center gap-1">
        {/* Jump to first */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className={navBtnClass}
            title="First page"
          >
            <ChevronsLeft size={14} />
          </button>
        )}

        {/* Previous */}
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={navBtnClass}
          title="Previous page"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page number buttons */}
        {pageNumbers.map((pageItem) => {
          if (pageItem === "left-dots" || pageItem === "right-dots") {
            return (
              <span
                key={pageItem}
                className="w-8 h-8 flex items-center justify-center text-[13px] font-semibold text-base-content/30 select-none"
              >
                …
              </span>
            );
          }

          const isActive = pageItem === currentPage;
          return (
            <button
              type="button"
              key={pageItem}
              onClick={() => goToPage(pageItem)}
              className={
                isActive
                  ? "w-8 h-8 rounded-lg text-[13px] font-bold bg-primary text-primary-content border border-primary shadow-md shadow-primary/30 cursor-default transition-colors"
                  : `w-8 h-8 rounded-lg text-[13px] font-medium border border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200 hover:text-primary hover:border-primary/40 transition-colors`
              }
            >
              {pageItem}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={navBtnClass}
          title="Next page"
        >
          <ChevronRight size={14} />
        </button>

        {/* Jump to last */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className={navBtnClass}
            title="Last page"
          >
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
