const STORAGE_KEY = "daily-expense-tracker-v1";
const form = document.querySelector("#expenseForm");
const nameInput = document.querySelector("#expenseName");
const amountInput = document.querySelector("#expenseAmount");
const categoryInput = document.querySelector("#expenseCategory");
const categoryFilter = document.querySelector("#categoryFilter");
const list = document.querySelector("#expenseList");
const emptyState = document.querySelector("#emptyState");
const totalAmount = document.querySelector("#totalAmount");
const expenseCount = document.querySelector("#expenseCount");
const largestAmount = document.querySelector("#largestAmount");
const largestLabel = document.querySelector("#largestLabel");
const formMessage = document.querySelector("#formMessage");
const clearAllButton = document.querySelector("#clearAll");
const icons = {Food:"🍜",Travel:"🚌",Shopping:"🛍️",Bills:"🧾",Study:"📚",Other:"📌"};

let expenses = loadExpenses();
function loadExpenses() {
  try { const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); return Array.isArray(data) ? data : []; }
  catch { return []; }
}
function saveExpenses() { localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)); }
function money(amount) {
  return new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",minimumFractionDigits:2}).format(amount);
}
function render() {
  const visible = categoryFilter.value === "All" ? expenses : expenses.filter(e => e.category === categoryFilter.value);
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const largest = expenses.reduce((best, e) => !best || e.amount > best.amount ? e : best, null);
  totalAmount.textContent = money(total);
  expenseCount.textContent = `${expenses.length} expense${expenses.length === 1 ? "" : "s"} recorded`;
  largestAmount.textContent = money(largest ? largest.amount : 0);
  largestLabel.textContent = largest ? largest.name : "No expenses yet";
  list.replaceChildren();
  emptyState.hidden = visible.length > 0;
  for (const expense of visible) {
    const item = document.createElement("li"); item.className = "expense-item";
    const icon = document.createElement("span"); icon.className = "category-icon"; icon.textContent = icons[expense.category] || icons.Other; icon.setAttribute("aria-hidden","true");
    const info = document.createElement("div"); info.className = "expense-info";
    const title = document.createElement("strong"); title.textContent = expense.name;
    const meta = document.createElement("small"); meta.textContent = `${expense.category} · ${expense.date}`;
    info.append(title,meta);
    const amount = document.createElement("span"); amount.className = "expense-amount"; amount.textContent = money(expense.amount);
    const remove = document.createElement("button"); remove.className = "delete-btn"; remove.type = "button"; remove.textContent = "Delete"; remove.setAttribute("aria-label",`Delete ${expense.name}`);
    remove.addEventListener("click", () => { expenses = expenses.filter(e => e.id !== expense.id); saveExpenses(); render(); });
    item.append(icon,info,amount,remove); list.append(item);
  }
  clearAllButton.disabled = expenses.length === 0;
  clearAllButton.style.opacity = expenses.length === 0 ? "0.55" : "1";
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const name = nameInput.value.trim(); const amount = Number(amountInput.value);
  if (!name || !Number.isFinite(amount) || amount <= 0) { formMessage.textContent = "Enter a name and an amount greater than zero."; return; }
  expenses.unshift({id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,name,amount:Math.round(amount*100)/100,category:categoryInput.value,date:new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})});
  saveExpenses(); form.reset(); formMessage.textContent = "Expense added successfully!"; render(); nameInput.focus();
});
categoryFilter.addEventListener("change",render);
clearAllButton.addEventListener("click", () => {
  if (!expenses.length || !window.confirm("Delete all saved expenses? This cannot be undone.")) return;
  expenses = []; saveExpenses(); render(); formMessage.textContent = "All expenses cleared.";
});
render();
