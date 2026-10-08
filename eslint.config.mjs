import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Regra de dependência da Clean Architecture (docs/constitution.md): cada camada só importa
// das camadas mais internas.
const LAYER = {
  domain: { group: ["@/domain", "@/domain/*"], message: "domain é a camada mais interna." },
  application: {
    group: ["@/application", "@/application/*"],
    message: "Camadas internas não conhecem application.",
  },
  infrastructure: {
    group: ["@/infrastructure", "@/infrastructure/*"],
    message: "Só main (e o proxy) usam infrastructure; o resto depende das portas de application.",
  },
  presentation: {
    group: ["@/presentation", "@/presentation/*"],
    message: "Só app compõe componentes de presentation.",
  },
  main: { group: ["@/main", "@/main/*"], message: "Só app usa as factories de main." },
  app: { group: ["@/app", "@/app/*"], message: "Nenhuma camada importa de app; ações chegam por props." },
  shared: { group: ["@/shared", "@/shared/*"], message: "shared não depende de nada do projeto." },
  react: { group: ["react", "react-dom", "react/*"], message: "Esta camada não usa React." },
  next: { group: ["next", "next/*"], message: "Esta camada não depende do Next." },
  supabase: { group: ["@supabase/*"], message: "Supabase fica atrás das portas, em infrastructure." },
  zod: { group: ["zod", "zod/*"], message: "Validação de entrada fica em application/schemas." },
  dateFns: {
    group: ["date-fns", "date-fns/*"],
    message: "Use as funções de @/shared (calendar-date).",
  },
};

function forbid(files, ...layers) {
  return {
    files,
    rules: {
      "no-restricted-imports": ["error", { patterns: layers.map((name) => LAYER[name]) }],
    },
  };
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": true, "ts-expect-error": "allow-with-description" },
      ],
    },
  },
  forbid(
    ["src/domain/**"],
    "application", "infrastructure", "presentation", "main", "app",
    "react", "next", "supabase", "zod", "dateFns",
  ),
  forbid(
    ["src/application/**"],
    "infrastructure", "presentation", "main", "app", "react", "next", "supabase",
  ),
  forbid(["src/infrastructure/**"], "presentation", "main", "app", "react"),
  forbid(["src/presentation/**"], "infrastructure", "main", "app", "supabase"),
  forbid(["src/main/**"], "presentation", "app"),
  forbid(
    ["src/shared/**"],
    "domain", "application", "infrastructure", "presentation", "main", "app",
    "react", "next", "supabase",
  ),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
  ]),
]);

export default eslintConfig;
