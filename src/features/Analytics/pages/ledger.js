// Deterministic pseudo-random generator so numbers stay stable across renders
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const seedFromId = (id) => id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount || 0);
}

export function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function addWeeks(dateStr, weeks) {
  return addDays(dateStr, weeks * 7);
}

// Builds a 100-day daily collection ledger for a customer
export function buildDailyLedger(customer) {
  const rand = seededRandom(seedFromId(customer.id));
  const days = 100;
  const dailyAmount = customer.loanAmount / days;
  const today = new Date();
  const startDate = customer.joinedOn;
  const rows = [];
  let runningBalance = customer.loanAmount;
  let collected = 0;
  let lateDays = 0;
  let missedDays = 0;

  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const isFuture = new Date(date) > today;
    let statusRoll = rand();
    let status = "Pending";
    let collectedAmt = 0;
    let fine = 0;

    if (!isFuture) {
      if (statusRoll < 0.78) {
        status = "Paid";
        collectedAmt = dailyAmount;
      } else if (statusRoll < 0.9) {
        status = "Late";
        collectedAmt = dailyAmount;
        fine = 10;
        lateDays++;
      } else {
        status = "Missed";
        missedDays++;
      }
    }

    collected += collectedAmt;
    runningBalance -= collectedAmt;

    rows.push({
      day: i + 1,
      date,
      expected: Math.round(dailyAmount),
      collected: Math.round(collectedAmt),
      balance: Math.max(0, Math.round(runningBalance)),
      fine,
      collector: customer.collectorId,
      remarks: status === "Missed" ? "Not collected" : status === "Late" ? "Collected late" : status === "Paid" ? "On time" : "-",
      status,
    });
  }

  return {
    rows,
    totalCollected: Math.round(collected),
    remainingBalance: Math.max(0, Math.round(customer.loanAmount - collected)),
    lateDays,
    missedDays,
    percentPaid: Math.round((collected / customer.loanAmount) * 100),
    nextDue: rows.find((r) => r.status === "Pending")?.date || null,
    dailyAmount: Math.round(dailyAmount),
  };
}

// Builds a 10-week collection ledger for a customer
export function buildWeeklyLedger(customer) {
  const rand = seededRandom(seedFromId(customer.id) + 7);
  const weeks = 10;
  const weeklyAmount = customer.loanAmount / weeks;
  const today = new Date();
  const startDate = customer.joinedOn;
  const rows = [];
  let collected = 0;

  for (let i = 0; i < weeks; i++) {
    const date = addWeeks(startDate, i);
    const isFuture = new Date(date) > today;
    let status = "Pending";
    let collectedAmt = 0;

    if (!isFuture) {
      const roll = rand();
      if (roll < 0.75) {
        status = "Paid";
        collectedAmt = weeklyAmount;
      } else if (roll < 0.9) {
        status = "Late";
        collectedAmt = weeklyAmount;
      } else {
        status = "Missed";
      }
    }

    collected += collectedAmt;

    rows.push({
      week: i + 1,
      date,
      expected: Math.round(weeklyAmount),
      collected: Math.round(collectedAmt),
      pending: Math.round(weeklyAmount - collectedAmt),
      status,
      collector: customer.collectorId,
      paymentDate: status !== "Pending" && status !== "Missed" ? date : null,
    });
  }

  return {
    rows,
    totalCollected: Math.round(collected),
    remainingBalance: Math.max(0, Math.round(customer.loanAmount - collected)),
    percentPaid: Math.round((collected / customer.loanAmount) * 100),
    nextDue: rows.find((r) => r.status === "Pending")?.date || null,
    weeklyAmount: Math.round(weeklyAmount),
  };
}

export function riskScore(percentPaid, missedOrLate) {
  if (percentPaid >= 85 && missedOrLate <= 2) return { label: "Excellent", color: "success" };
  if (percentPaid >= 65 && missedOrLate <= 5) return { label: "Good", color: "primary" };
  if (percentPaid >= 40) return { label: "Average", color: "warning" };
  return { label: "High Risk", color: "danger" };
}
