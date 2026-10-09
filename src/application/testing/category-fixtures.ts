import type { Category } from "@/domain";

/** Ids em formato uuid, como o schema exige. */
export const HOUSING: Category = {
  id: "11111111-1111-4111-8111-111111111111",
  kind: "expense",
  name: "Moradia",
  backgroundColor: "#dbeafe",
  textColor: "#1e3a8a",
};

export const LEISURE: Category = {
  id: "22222222-2222-4222-8222-222222222222",
  kind: "expense",
  name: "Lazer",
  backgroundColor: "#dcfce7",
  textColor: "#166534",
};

export const SALARY: Category = {
  id: "33333333-3333-4333-8333-333333333333",
  kind: "income",
  name: "Salário",
  backgroundColor: "#d1fae5",
  textColor: "#065f46",
};

/** Id válido que não existe no repositório (ex.: categoria de outro usuário, escondida pelo RLS). */
export const UNKNOWN_CATEGORY_ID = "99999999-9999-4999-8999-999999999999";
