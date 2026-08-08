import { customers, collectors } from "./customers";
import { buildDailyLedger, buildWeeklyLedger } from "./ledger";

export function getCustomerLedger(customer) {
  return customer.collectionType === "Daily" ? buildDailyLedger(customer) : buildWeeklyLedger(customer);
}

export function getDashboardStats() {
  let dailyCollected = 0, weeklyCollected = 0, pending = 0, todaysDue = 0, overdue = 0, profit = 0;
  const today = new Date().toISOString().slice(0, 10);

  customers.forEach((c) => {
    const ledger = getCustomerLedger(c);
    pending += ledger.remainingBalance;
    profit += Math.round(c.loanAmount * (c.interestRate / 100)) + c.processingFee;
    if (c.status === "Overdue") overdue++;

    if (c.collectionType === "Daily") {
      const todayRow = ledger.rows.find((r) => r.date === today);
      if (todayRow) {
        dailyCollected += todayRow.collected;
        if (todayRow.status === "Pending") todaysDue++;
      }
    } else {
      const thisWeek = ledger.rows.find((r) => r.date === today);
      if (thisWeek) {
        weeklyCollected += thisWeek.collected;
        if (thisWeek.status === "Pending") todaysDue++;
      }
    }
  });

  return {
    totalCustomers: customers.length,
    activeLoans: customers.filter((c) => c.status === "Active").length,
    dailyCollection: dailyCollected || 8400,
    weeklyCollection: weeklyCollected || 42000,
    pendingAmount: pending,
    todaysDue: todaysDue || 12,
    overdueCustomers: overdue,
    totalProfit: profit,
  };
}

export function getCollectionTrend() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d, i) => ({
    day: d,
    collected: 6800 + Math.round(Math.sin(i) * 1400) + i * 220,
    expected: 8200 + i * 180,
  }));
}

export function getWeeklyPerformance() {
  return Array.from({ length: 10 }).map((_, i) => ({
    week: `W${i + 1}`,
    collected: 32000 + Math.round(Math.cos(i) * 6000) + i * 900,
    target: 38000 + i * 700,
  }));
}

export function getMonthlyIncome() {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  return months.map((m, i) => ({ month: m, income: 180000 + i * 24000 + (i % 2 === 0 ? 9000 : -4000) }));
}

export function getLoanDistribution() {
  const daily = customers.filter((c) => c.collectionType === "Daily").length;
  const weekly = customers.filter((c) => c.collectionType === "Weekly").length;
  return [
    { name: "Daily (100 Days)", value: daily, color: "#2563EB" },
    { name: "Weekly (10 Weeks)", value: weekly, color: "#10B981" },
  ];
}

export function getVillageWise() {
  const map = {};
  customers.forEach((c) => {
    map[c.village] = (map[c.village] || 0) + 1;
  });
  return Object.entries(map).map(([village, count]) => ({ village, count }));
}

export function getCustomerGrowth() {
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  let total = 6;
  return months.map((m) => {
    total += Math.floor(3 + Math.random() * 4);
    return { month: m, customers: total };
  });
}

export function getRecentPayments() {
  return customers.slice(0, 8).map((c, i) => ({
    id: `PAY-${2000 + i}`,
    customer: c.name,
    customerId: c.id,
    amount: c.collectionType === "Daily" ? 100 : 2000,
    mode: ["Cash", "UPI", "Bank"][i % 3],
    time: `${9 + (i % 8)}:${(i * 7) % 60 < 10 ? "0" : ""}${(i * 7) % 60} AM`,
    photo: c.photo,
  }));
}

export function getNotifications() {
  const list = [];
  customers.slice(0, 6).forEach((c, i) => {
    list.push({
      id: `N-${i}`,
      type: i % 4 === 0 ? "overdue" : i % 4 === 1 ? "due-today" : i % 4 === 2 ? "completed" : "new-customer",
      customer: c.name,
      customerId: c.id,
      message:
        i % 4 === 0
          ? `Payment overdue for ${c.name}`
          : i % 4 === 1
          ? `${c.name}'s collection is due today`
          : i % 4 === 2
          ? `${c.name} completed the loan cycle`
          : `${c.name} joined as a new customer`,
      time: `${i + 1}h ago`,
    });
  });
  return list;
}

export { customers, collectors };
