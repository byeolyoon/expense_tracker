import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "expenses.json");

// 파일에서 데이터를 읽는 함수
const readExpensesFromFile = (): any[] => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading file:", error);
    return [];
  }
};

// 파일에 데이터를 쓰는 함수
const writeExpensesToFile = (data: any[]) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to file:", error);
  }
};

export async function GET() {
  const expenses = readExpensesFromFile();
  return NextResponse.json(expenses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { type, amount, description } = body;

  if (!type || !amount || !description) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const newExpense = { id: Date.now(), type, amount, description };
  const expenses = readExpensesFromFile();
  expenses.push(newExpense);
  writeExpensesToFile(expenses);

  return NextResponse.json(newExpense);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  let expenses = readExpensesFromFile();
  expenses = expenses.filter((expense) => expense.id !== Number(id));
  writeExpensesToFile(expenses);

  return NextResponse.json({ message: "Deleted" });
}
