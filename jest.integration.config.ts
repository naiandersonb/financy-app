import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

// Testes contra o Supabase local (Docker). Ficam fora do `npm test` e da cobertura.
const config: Config = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/supabase/tests/**/*.integration.test.ts"],
  globalSetup: "<rootDir>/supabase/tests/global-setup.ts",
  // As suítes criam e apagam usuários no mesmo banco; rodar em sequência evita interferência.
  maxWorkers: 1,
};

export default createJestConfig(config);
