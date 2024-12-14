"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [expenses, setExpenses] = useState<
    {
      id: number;
      type: "income" | "expense";
      amount: number;
      description: string;
    }[]
  >([]);
  const [type, setType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");

  // Fetch 데이터
  useEffect(() => {
    fetch("/api/expenses")
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error("Failed to fetch expenses:", err));
  }, []);

  // 데이터 추가 함수
  const handleAddExpense = async () => {
    if (!type || !amount || !description) {
      alert("모든 필드를 채워주세요!");
      return;
    }

    const newExpense = { type, amount: Number(amount), description };

    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newExpense),
      });

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const addedExpense = await response.json();
      setExpenses((prev) => [...prev, addedExpense]); // 새 데이터 추가
      setAmount(""); // 입력 필드 초기화
      setDescription("");
    } catch (err) {
      console.error("Error adding expense:", err);
    }
  };

  // 삭제 함수
  const handleDeleteExpense = async (id: number) => {
    try {
      const response = await fetch(`/api/expenses?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      setExpenses((prev) => prev.filter((expense) => expense.id !== id)); // 삭제된 항목 제거
    } catch (err) {
      console.error("Error deleting expense:", err);
    }
  };

  // 천 단위 콤마 추가 함수
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0, // 소수점 표시 안함
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-gray-100 rounded-lg shadow-md mt-10">
      {/* 제목 */}
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
        💸 Expense Tracker
      </h1>

      {/* 입력 폼 */}
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Add New Expense
        </h2>
        <div className="flex flex-wrap gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "income" | "expense")}
            className="border-gray-300 rounded-md p-2 w-full sm:w-auto text-black"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Amount"
            className="border-gray-300 rounded-md p-2 flex-grow text-black"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="border-gray-300 rounded-md p-2 flex-grow text-black"
          />
          <button
            onClick={handleAddExpense}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* 데이터 리스트 */}
      <div className="bg-white p-4 rounded-md shadow-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Expenses</h2>
        {expenses.length === 0 ? (
          <p className="text-gray-500 text-center">No expenses to show</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex justify-between items-center py-2"
              >
                <div>
                  <span
                    className={`${
                      expense.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    } font-bold`}
                  >
                    {expense.type === "income" ? "💰 Income:" : "🛍️ Expense:"}
                  </span>{" "}
                  <span className="text-black">{expense.description}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-700">
                    {formatCurrency(expense.amount)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
