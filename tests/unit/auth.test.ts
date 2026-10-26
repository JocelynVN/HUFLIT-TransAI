import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";
import { Role } from "@prisma/client";

describe("Auth Utilities", () => {
  it("should hash and verify password correctly", async () => {
    const raw = "studentSecure123";
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    const valid = await verifyPassword(raw, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword("wrongPass", hash);
    expect(invalid).toBe(false);
  });

  it("should create and verify JWT session token with roles", async () => {
    const userPayload = {
      id: "test-user-uuid",
      email: "test@huflit.edu.vn",
      name: "Nguyễn Văn Test",
      roles: [Role.STUDENT, Role.TEACHER],
    };

    const token = await createSessionToken(userPayload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe(userPayload.id);
    expect(decoded?.email).toBe(userPayload.email);
    expect(decoded?.roles).toContain(Role.STUDENT);
    expect(decoded?.roles).toContain(Role.TEACHER);
  });

  it("should return null for invalid token", async () => {
    const invalid = await verifySessionToken("invalid.token.payload");
    expect(invalid).toBeNull();
  });
});
