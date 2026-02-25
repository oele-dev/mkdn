import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const originalEnv = process.env.XDG_CONFIG_HOME;

describe("auth", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "mkdn-test-"));
    process.env.XDG_CONFIG_HOME = tempDir;
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
    if (originalEnv) {
      process.env.XDG_CONFIG_HOME = originalEnv;
    } else {
      delete process.env.XDG_CONFIG_HOME;
    }
  });

  it("should return null when no config exists", async () => {
    const { getConfig } = await import("../src/auth.js");
    // Force re-read by calling directly
    assert.equal(getConfig(), null);
  });

  it("should save and read config", async () => {
    const { saveConfig, getConfig } = await import("../src/auth.js");
    saveConfig({ accountId: "test-id", apiToken: "test-token" });
    const config = getConfig();
    assert.deepEqual(config, { accountId: "test-id", apiToken: "test-token" });
  });

  it("should clear config", async () => {
    const { saveConfig, clearConfig, hasConfig } = await import("../src/auth.js");
    saveConfig({ accountId: "test-id", apiToken: "test-token" });
    assert.equal(hasConfig(), true);
    clearConfig();
    assert.equal(hasConfig(), false);
  });
});
