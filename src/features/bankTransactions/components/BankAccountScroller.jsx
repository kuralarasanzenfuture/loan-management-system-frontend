import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  ChevronLeft,
  ChevronRight,
  Layers,
  Star,
  IndianRupee,
  ExternalLink,
} from "lucide-react";
import { fetchCompanyBanks } from "../../../redux/companyBanks/companyBankSlice.js";

const CARD_COLORS = [
  "#C7A248",
  "#1F3F60",
  "#4C9A6A",
  "#3B82F6",
  "#B3483F",
  "#8B5CF6",
  "#D97706",
  "#0D9488",
];

function colorForBank(id, name) {
  const seed = String(id ?? name ?? "")
    .split("")
    .reduce((a, c) => a + c.charCodeAt(0), 0);
  return CARD_COLORS[seed % CARD_COLORS.length];
}

function maskAccountNumber(accountNumber) {
  if (!accountNumber) return "•••• ----";
  const str = String(accountNumber);
  const last4 = str.slice(-4);
  return `•••• ${last4}`;
}

function formatAmount(val) {
  const num = Number(val || 0);
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * BankAccountScroller
 * Horizontal scrollable row of company bank account cards.
 *
 * Props:
 * - activeBankId (number|string|null): Currently selected bank account ID
 * - onSelectBank (function): Optional callback when a card is selected (bank object or null for 'all')
 * - showAllOption (boolean): Whether to render the 'All Accounts' card (default: true)
 */
export default function BankAccountScroller({
  activeBankId,
  onSelectBank,
  showAllOption = true,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { companyBanks = [], banks: legacyBanks = [], loading } = useSelector(
    (state) => state.companyBanks || {}
  );
  const banks = companyBanks.length > 0 ? companyBanks : legacyBanks;

  useEffect(() => {
    dispatch(fetchCompanyBanks());
  }, [dispatch]);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [banks]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -240 : 240;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleCardClick = (bank) => {
    if (onSelectBank) {
      onSelectBank(bank);
    } else if (bank) {
      navigate(`/bank-accounts/${bank.id}`);
    }
  };

  const skeletons = useMemo(() => Array.from({ length: 3 }), []);

  if (!loading && banks.length === 0) {
    return null;
  }

  const isAllActive = activeBankId == null || activeBankId === "all";

  return (
    <div className="mb-6 relative">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-base-content/50">
            Bank Accounts
          </p>
          <span className="badge badge-sm badge-ghost text-[11px] font-medium">
            {banks.length} {banks.length === 1 ? "account" : "accounts"}
          </span>
        </div>

        {/* Scroll arrow buttons for desktop */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="btn btn-ghost btn-xs btn-circle disabled:opacity-30"
            title="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="btn btn-ghost btn-xs btn-circle disabled:opacity-30"
            title="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Loading Skeletons */}
        {loading && banks.length === 0 &&
          skeletons.map((_, i) => (
            <div
              key={i}
              className="shrink-0 snap-start w-[230px] h-[130px] rounded-2xl border border-base-300 bg-base-100/60 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 bg-base-300 rounded w-28" />
                <div className="w-8 h-8 rounded-xl bg-base-300" />
              </div>
              <div className="space-y-1.5">
                <div className="h-3 bg-base-300 rounded w-20" />
                <div className="h-4 bg-base-300 rounded w-24" />
              </div>
              <div className="h-7 bg-base-300 rounded-lg w-full" />
            </div>
          ))}

        {/* All Accounts Option (if onSelectBank is supported or enabled) */}
        {showAllOption && onSelectBank && !loading && banks.length > 1 && (
          <button
            type="button"
            onClick={() => handleCardClick(null)}
            className={`shrink-0 snap-start w-[230px] text-left rounded-2xl border bg-base-100 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer ${
              isAllActive
                ? "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10 bg-primary/[0.03]"
                : "border-base-300 hover:border-primary/40 hover:shadow-sm"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <span className="text-sm font-bold text-base-content block truncate">
                    All Accounts
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    Combined view
                  </span>
                </div>
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-xl shrink-0 transition-colors ${
                    isAllActive
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-base-content/70 group-hover:bg-primary/20 group-hover:text-primary"
                  }`}
                >
                  <Layers size={16} />
                </span>
              </div>
              <p className="text-[11px] text-base-content/50 mb-2">
                Showing all transactions
              </p>
            </div>

            <div
              className={`text-center text-xs font-semibold py-1.5 px-3 rounded-xl transition-colors ${
                isAllActive
                  ? "bg-primary text-primary-content"
                  : "bg-base-200 text-base-content/70 group-hover:bg-base-300"
              }`}
            >
              {isAllActive ? "Viewing All" : "Select All"}
            </div>
          </button>
        )}

        {/* Individual Bank Cards */}
        {banks.map((bank) => {
          const isActive =
            activeBankId != null && String(activeBankId) === String(bank.id);
          const color = colorForBank(bank.id, bank.bank_name);
          const balance = bank.current_balance ?? bank.opening_balance ?? 0;

          return (
            <div
              key={bank.id}
              onClick={() => handleCardClick(bank)}
              className={`shrink-0 snap-start w-[230px] text-left rounded-2xl border bg-base-100 p-4 transition-all duration-200 group flex flex-col justify-between cursor-pointer ${
                isActive
                  ? "border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10 bg-primary/[0.03]"
                  : "border-base-300 hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-base-content truncate leading-tight block">
                        {bank.bank_name || "Bank Account"}
                      </span>
                      {Boolean(bank.is_primary) && (
                        <span
                          className="text-amber-500 shrink-0"
                          title="Primary Account"
                        >
                          <Star size={12} className="fill-amber-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-base-content/50 truncate">
                      {bank.account_type
                        ? bank.account_type.replace(/_/g, " ")
                        : "Account"}{" "}
                      · {maskAccountNumber(bank.account_number)}
                    </p>
                  </div>

                  <span
                    className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0 text-white text-[10px] font-bold shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    <Landmark size={15} />
                  </span>
                </div>

                <div className="mt-2 mb-3 bg-base-200/50 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-base-content/50">
                    Balance
                  </span>
                  <span className="text-xs font-bold font-mono text-base-content">
                    {formatAmount(balance)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className={`flex-1 text-center text-xs font-semibold py-1.5 rounded-xl transition-colors ${
                    isActive
                      ? "bg-primary text-primary-content"
                      : "bg-base-200 text-base-content/70 group-hover:bg-base-300"
                  }`}
                >
                  {isActive ? "Viewing Ledger" : "View Ledger"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/bank-accounts/${bank.id}`);
                  }}
                  className="btn btn-ghost btn-xs btn-square rounded-xl text-base-content/40 hover:text-primary hover:bg-base-200"
                  title="Open Bank Details"
                >
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}