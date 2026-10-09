import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const COVERAGE_MINIMUM = { lines: 91, branches: 91, functions: 91, statements: 91 };

// Componentes gerados pelo shadcn ficam fora da cobertura; um arquivo editado à mão sai desta lista.
const SHADCN_GENERATED_COMPONENTS = [
  "button",
  "card",
  "dialog",
  "input",
  "label",
  "native-select",
  "progress",
];

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Testes de integração (supabase/tests) rodam à parte, com `npm run test:integration`.
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/supabase/"],
  moduleNameMapper: {
    "^server-only$": "<rootDir>/jest.server-only-stub.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/src/app/.*/?(page|layout|loading|error|not-found)\\.tsx$",
    "/src/main/",
    "/index\\.ts$",
    "\\.types\\.ts$",
    "/src/application/ports/",
    ...SHADCN_GENERATED_COMPONENTS.map(
      (name) => `/src/presentation/components/${name}\\.tsx$`,
    ),
  ],
  coverageProvider: "v8",
  coverageThreshold: {
    global: COVERAGE_MINIMUM,
    "./src/presentation/features/auth/": COVERAGE_MINIMUM,
    "./src/presentation/features/categories/": COVERAGE_MINIMUM,
    "./src/presentation/features/transactions/": COVERAGE_MINIMUM,
  },
};

export default createJestConfig(config);
