const villages = ["Dharmapuri", "Salem", "Krishnagiri", "Harur", "Pennagaram", "Palacode", "Hosur", "Uthangarai"];
const firstNames = ["Ramesh", "Suresh", "Kumar", "Lakshmi", "Meena", "Prabha", "Selvam", "Muthu", "Saravanan", "Vijaya", "Deepa", "Anitha", "Karthik", "Mohan", "Geetha", "Rajesh", "Priya", "Bala", "Shanthi", "Murugan"];
const lastNames = ["Gounder", "Naidu", "Chettiar", "Pillai", "Reddy", "Devar", "Naicker", "Rao"];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rand = seededRandom(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pad = (n, len = 4) => String(n).padStart(len, "0");

export const collectors = [
  { id: "COL-01", name: "Arun Kumar", phone: "9843211001", villages: ["Dharmapuri", "Palacode"] },
  { id: "COL-02", name: "Vetri Selvan", phone: "9843211002", villages: ["Salem", "Hosur"] },
  { id: "COL-03", name: "Kalaiselvi", phone: "9843211003", villages: ["Krishnagiri", "Uthangarai"] },
  { id: "COL-04", name: "Boopathy", phone: "9843211004", villages: ["Harur", "Pennagaram"] },
];

export const customers = Array.from({ length: 48 }).map((_, i) => {
  const collectionType = i % 3 === 0 ? "Weekly" : "Daily";
  const loanAmount = collectionType === "Daily" ? 10000 : 20000;
  const status = pick(["Active", "Active", "Active", "Completed", "Overdue"]);
  const village = pick(villages);
  const collector = collectors.find((c) => c.villages.includes(village)) || collectors[0];
  return {
    id: `CUS-${pad(1000 + i)}`,
    name: `${pick(firstNames)} ${pick(lastNames)}`,
    fatherName: `${pick(firstNames)} ${pick(lastNames)}`,
    mobile: `9${Math.floor(100000000 + rand() * 899999999)}`.slice(0, 10),
    village,
    address: `${Math.floor(rand() * 200) + 1}, Main Street, ${village}`,
    aadhar: `${Math.floor(1000 + rand() * 8999)} ${Math.floor(1000 + rand() * 8999)} ${Math.floor(1000 + rand() * 8999)}`,
    loanAmount,
    collectionType,
    status,
    collectorId: collector.id,
    photo: `https://i.pravatar.cc/150?img=${(i % 70) + 1}`,
    joinedOn: `2026-0${(i % 6) + 1}-${pad((i % 27) + 1, 2)}`,
    interestRate: collectionType === "Daily" ? 2 : 2.5,
    processingFee: collectionType === "Daily" ? 200 : 400,
  };
});

export const getCustomerById = (id) => customers.find((c) => c.id === id);
export const getCollectorById = (id) => collectors.find((c) => c.id === id);
