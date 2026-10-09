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

  describe("chave pública", () => {
    function jwtWithRole(role: string) {
      const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
      return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ iss: "supabase", role })}.assinatura`;
    }

    function loadWithKey(key: string) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://exemplo.supabase.co";
      process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = key;
      return loadEnv;
    }

    const SECRET_KEY_MESSAGE =
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY contém uma chave secreta. Use a Publishable key " +
      "(sb_publishable_...) do painel do Supabase; a chave secreta nunca deve ficar numa " +
      "variável NEXT_PUBLIC_.";

    it.each([
      ["sb_secret_", "sb_secret_abc123valor"],
      ["JWT legado de service_role", jwtWithRole("service_role")],
    ])("recusa %s sem mostrar o valor da chave", (_name, key) => {
      const load = loadWithKey(key);
      expect(load).toThrow(SECRET_KEY_MESSAGE);
      try {
        load();
      } catch (error) {
        expect(String((error as Error).message)).not.toContain(key);
      }
    });

    it.each([
      ["sb_publishable_", "sb_publishable_abc123"],
      ["JWT legado de anon", jwtWithRole("anon")],
      ["texto com pontos que não é JWT", "nao.e.jwt"],
    ])("aceita %s", (_name, key) => {
      expect(loadWithKey(key)()?.supabasePublishableKey).toBe(key);
    });
  });
});

