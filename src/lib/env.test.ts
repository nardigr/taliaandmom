import assert from "node:assert/strict";
import { test } from "node:test";
import { parseEnv } from "./env.schema";

const validBase: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/taljamom",
  AUTH_SECRET: "test-secret-with-enough-length-for-auth",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

test("parseEnv accepts valid configuration", () => {
  const result = parseEnv(validBase);
  assert.equal(result.DATABASE_URL, validBase.DATABASE_URL);
  assert.equal(result.AUTH_SECRET, validBase.AUTH_SECRET);
});

test("parseEnv fails fast when DATABASE_URL is missing", () => {
  assert.throws(
    () => parseEnv({ ...validBase, DATABASE_URL: "" }),
    (error: Error) => {
      assert.match(error.message, /Invalid environment variables/);
      assert.match(error.message, /DATABASE_URL/);
      return true;
    },
  );
});

test("parseEnv fails fast when AUTH_SECRET is missing", () => {
  assert.throws(
    () => parseEnv({ ...validBase, AUTH_SECRET: "" }),
    (error: Error) => {
      assert.match(error.message, /AUTH_SECRET/);
      return true;
    },
  );
});

test("parseEnv rejects partial SMTP configuration", () => {
  assert.throws(
    () =>
      parseEnv({
        ...validBase,
        SMTP_HOST: "smtp.example.com",
      }),
    /SMTP_HOST/,
  );
});
