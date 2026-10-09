/** @jest-environment node */
describe("env", () => {
  const original = { ...process.env };

  afterEach(() => {
    process.env = { ...original };
  });

  function loadEnv() {
    let envModule: typeof import("./env") | undefined;
    jest.isolateModules(() => {
      envModule = jest.requireActual<typeof import("./env")>("./env");
    });
    return envModule;
  }

  it("expõe URL e chave quando estão definidas", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://exemplo.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_teste";
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
    expect(loadEnv()).toEqual({
      supabaseUrl: "https://exemplo.supabase.co",
      supabasePublishableKey: "sb_publishable_teste",
      siteUrl: "http://localhost:3000",
    });
  });

  it.each(["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SITE_URL"])(
    "falha com mensagem clara quando %s não está definida",
    (name) => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://exemplo.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_teste";
      process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
      delete process.env[name];
      expect(loadEnv).toThrow(`Variável de ambiente ${name} não definida`);
    },
  );
});
