import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  test("Create user account", async () => {
    const createUserResponde = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registration.flow@curso.dev",
          password: "senhasegura123",
        }),
      },
    );

    expect(createUserResponde.status).toBe(201);

    const createUserRespondeBody = await createUserResponde.json();

    expect(createUserRespondeBody).toEqual({
      id: createUserRespondeBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@curso.dev",
      features: ["read:activation_token"],
      password: createUserRespondeBody.password,
      created_at: createUserRespondeBody.created_at,
      updated_at: createUserRespondeBody.updated_at,
    });
  });

  test("Receive activation email", async () => {});
  test("Activate account", async () => {});
  test("Login", async () => {});
  test("Get user information", async () => {});
});
