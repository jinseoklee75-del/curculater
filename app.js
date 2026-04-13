(function () {
  "use strict";

  const display = document.getElementById("display");
  const expressionEl = document.getElementById("expression");
  const keys = document.getElementById("keys");

  const ERROR = "0으로 나눌 수 없음";

  let current = "0";
  let stored = null;
  let op = null;
  let fresh = true;

  function formatForShow(n) {
    if (!Number.isFinite(n)) return "오류";
    const s = String(n);
    if (s.length > 12) {
      const exp = n.toExponential(6);
      return exp.length > 12 ? n.toExponential(4) : exp;
    }
    return s;
  }

  function updateView() {
    const num = parseFloat(current);
    display.textContent = Number.isFinite(num) ? formatForShow(num) : current;
    if (stored !== null && op) {
      const sym = { "+": "+", "-": "−", "*": "×", "/": "÷" }[op] || op;
      expressionEl.textContent = `${formatForShow(stored)} ${sym}`;
    } else {
      expressionEl.textContent = "";
    }
  }

  function applyOp(a, b, operator) {
    switch (operator) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "*":
        return a * b;
      case "/":
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function inputDigit(d) {
    if (fresh) {
      current = d === "0" ? "0" : d;
      fresh = false;
    } else {
      if (current === "0" && d !== "0") current = d;
      else if (current === "0" && d === "0") return;
      else if (current.replace("-", "").replace(".", "").length < 14) current += d;
    }
  }

  function inputDot() {
    if (fresh) {
      current = "0.";
      fresh = false;
      return;
    }
    if (!current.includes(".")) current += ".";
  }

  function commitPending(nextOp) {
    const a = stored;
    const b = parseFloat(current);
    if (a === null || op === null) {
      stored = b;
      op = nextOp;
      fresh = true;
      return;
    }
    if (fresh) {
      op = nextOp;
      return;
    }
    const result = applyOp(a, b, op);
    if (!Number.isFinite(result)) {
      current = ERROR;
      stored = null;
      op = null;
      fresh = true;
      return;
    }
    stored = result;
    op = nextOp;
    current = String(result);
    fresh = true;
  }

  function equals() {
    if (stored === null || op === null) return;
    const a = stored;
    const b = parseFloat(current);
    const result = applyOp(a, b, op);
    if (!Number.isFinite(result)) {
      current = ERROR;
    } else {
      current = String(result);
    }
    stored = null;
    op = null;
    fresh = true;
  }

  function clearAll() {
    current = "0";
    stored = null;
    op = null;
    fresh = true;
  }

  function toggleSign() {
    if (current === ERROR) return;
    const n = parseFloat(current);
    if (!Number.isFinite(n)) return;
    current = String(-n);
    fresh = false;
  }

  function percent() {
    const n = parseFloat(current);
    if (!Number.isFinite(n)) return;
    current = String(n / 100);
    fresh = false;
  }

  keys.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    if (current === ERROR) clearAll();

    const digit = btn.dataset.digit;
    if (digit !== undefined) {
      inputDigit(digit);
      updateView();
      return;
    }

    const action = btn.dataset.action;
    if (action === "dot") {
      inputDot();
      updateView();
      return;
    }
    if (action === "clear") {
      clearAll();
      updateView();
      return;
    }
    if (action === "sign") {
      toggleSign();
      updateView();
      return;
    }
    if (action === "percent") {
      percent();
      updateView();
      return;
    }
    if (action === "op") {
      commitPending(btn.dataset.op);
      updateView();
      return;
    }
    if (action === "equals") {
      equals();
      updateView();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (current === ERROR && e.key !== "Escape") clearAll();

    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
      inputDigit(e.key);
      updateView();
      return;
    }
    if (e.key === ".") {
      e.preventDefault();
      inputDot();
      updateView();
      return;
    }
    const opMap = { "+": "+", "-": "-", "*": "*", "/": "/" };
    if (opMap[e.key]) {
      e.preventDefault();
      commitPending(opMap[e.key]);
      updateView();
      return;
    }
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      equals();
      updateView();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      clearAll();
      updateView();
      return;
    }
    if (e.key === "Backspace") {
      e.preventDefault();
      if (fresh) return;
      if (current.length <= 1) current = "0";
      else current = current.slice(0, -1);
      updateView();
    }
  });

  updateView();
})();
