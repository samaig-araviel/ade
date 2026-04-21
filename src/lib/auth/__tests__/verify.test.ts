import {
  SignJWT,
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  type CryptoKey,
} from "jose";
import { verifyAdeRequest } from "../verify";
import { AdeAuthError } from "../types";
import { __resetAdeAuthKeysForTests } from "../keys";

interface TestKeys {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}

const CURRENT_KID = "test-current-v1";
const PREVIOUS_KID = "test-previous-v0";
const CALLER_SECRET_CURRENT = "current-shared-secret-0123456789ab";
const CALLER_SECRET_PREVIOUS = "previous-shared-secret-abcdef012345";

async function generateEd25519Keys(): Promise<TestKeys> {
  const { privateKey, publicKey } = await generateKeyPair("EdDSA", {
    crv: "Ed25519",
    extractable: true,
  });
  return { privateKey, publicKey };
}

async function encodePublicKeyAsBase64Pem(
  publicKey: CryptoKey
): Promise<string> {
  const pem = await exportSPKI(publicKey);
  return Buffer.from(pem, "utf-8").toString("base64");
}

async function signTestToken(
  privateKey: CryptoKey,
  options: {
    kid?: string;
    issuer?: string;
    audience?: string;
    expiresInSeconds?: number;
    notBeforeOffsetSeconds?: number;
  } = {}
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const kid = options.kid ?? CURRENT_KID;
  const exp = iat + (options.expiresInSeconds ?? 60 * 60);
  const nbf = iat + (options.notBeforeOffsetSeconds ?? 0);

  return new SignJWT({})
    .setProtectedHeader({ alg: "EdDSA", kid, typ: "JWT" })
    .setIssuer(options.issuer ?? "araviel-api")
    .setAudience(options.audience ?? "ade")
    .setIssuedAt(iat)
    .setNotBefore(nbf)
    .setExpirationTime(exp)
    .setJti("test-jti")
    .sign(privateKey);
}

function buildRequest(
  headers: Record<string, string>,
  path = "/api/v1/route"
): Request {
  return new Request(`https://ade.example.com${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt: "hello" }),
  });
}

describe("verifyAdeRequest", () => {
  let currentKeys: TestKeys;
  let previousKeys: TestKeys;
  let unrelatedKeys: TestKeys;

  beforeAll(async () => {
    currentKeys = await generateEd25519Keys();
    previousKeys = await generateEd25519Keys();
    unrelatedKeys = await generateEd25519Keys();

    process.env.ADE_JWT_PUBLIC_KEY_CURRENT = await encodePublicKeyAsBase64Pem(
      currentKeys.publicKey
    );
    process.env.ADE_JWT_KID_CURRENT = CURRENT_KID;
    process.env.ADE_CALLER_SECRET_CURRENT = CALLER_SECRET_CURRENT;

    process.env.ADE_JWT_PUBLIC_KEY_PREVIOUS = await encodePublicKeyAsBase64Pem(
      previousKeys.publicKey
    );
    process.env.ADE_JWT_KID_PREVIOUS = PREVIOUS_KID;
    process.env.ADE_CALLER_SECRET_PREVIOUS = CALLER_SECRET_PREVIOUS;

    // Ensure private keys are usable for signing in tests.
    void (await exportPKCS8(currentKeys.privateKey));
    void (await exportPKCS8(previousKeys.privateKey));
    void (await exportPKCS8(unrelatedKeys.privateKey));
  });

  beforeEach(() => {
    __resetAdeAuthKeysForTests();
  });

  it("accepts a valid token signed with the current key", async () => {
    const token = await signTestToken(currentKeys.privateKey);
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).resolves.toBeUndefined();
  });

  it("accepts a valid token signed with the previous key (rotation window)", async () => {
    const token = await signTestToken(previousKeys.privateKey, {
      kid: PREVIOUS_KID,
    });
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).resolves.toBeUndefined();
  });

  it("accepts the previous caller secret during rotation", async () => {
    const token = await signTestToken(currentKeys.privateKey);
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_PREVIOUS,
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).resolves.toBeUndefined();
  });

  it("rejects when the caller-auth header is missing", async () => {
    const token = await signTestToken(currentKeys.privateKey);
    const req = buildRequest({ authorization: `Bearer ${token}` });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "missing_caller_secret",
    });
  });

  it("rejects when the caller-auth header is wrong", async () => {
    const token = await signTestToken(currentKeys.privateKey);
    const req = buildRequest({
      "x-ade-caller-auth": "definitely-not-the-secret",
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "invalid_caller_secret",
    });
  });

  it("rejects when the Authorization header is missing", async () => {
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
    });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "missing_authorization_header",
    });
  });

  it("rejects a non-Bearer Authorization header", async () => {
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: "Basic dXNlcjpwYXNz",
    });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "malformed_authorization_header",
    });
  });

  it("rejects a token signed by an unrelated key", async () => {
    const token = await signTestToken(unrelatedKeys.privateKey);
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "invalid_token",
    });
  });

  it("rejects a token with an expired exp", async () => {
    const token = await signTestToken(currentKeys.privateKey, {
      expiresInSeconds: -120,
    });
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "expired_token",
    });
  });

  it("rejects a token with the wrong issuer", async () => {
    const token = await signTestToken(currentKeys.privateKey, {
      issuer: "attacker",
    });
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "wrong_issuer",
    });
  });

  it("rejects a token with the wrong audience", async () => {
    const token = await signTestToken(currentKeys.privateKey, {
      audience: "some-other-service",
    });
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "wrong_audience",
    });
  });

  it("rejects a token with an unknown kid", async () => {
    const token = await signTestToken(currentKeys.privateKey, {
      kid: "not-a-real-kid",
    });
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: `Bearer ${token}`,
    });
    await expect(verifyAdeRequest(req)).rejects.toMatchObject({
      reason: "unknown_key_id",
    });
  });

  it("rejects a tampered token", async () => {
    const token = await signTestToken(currentKeys.privateKey);
    const tamperedToken = token.slice(0, -4) + "AAAA";
    const req = buildRequest({
      "x-ade-caller-auth": CALLER_SECRET_CURRENT,
      authorization: `Bearer ${tamperedToken}`,
    });
    await expect(verifyAdeRequest(req)).rejects.toBeInstanceOf(AdeAuthError);
  });
});
