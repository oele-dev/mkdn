import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSupported, getMimeType, getSupportedExtensions } from "../src/formats.js";

describe("formats", () => {
  it("should recognize supported extensions", () => {
    assert.equal(isSupported("file.pdf"), true);
    assert.equal(isSupported("file.docx"), true);
    assert.equal(isSupported("file.xlsx"), true);
    assert.equal(isSupported("file.png"), true);
    assert.equal(isSupported("file.jpg"), true);
    assert.equal(isSupported("file.csv"), true);
    assert.equal(isSupported("file.html"), true);
  });

  it("should reject unsupported extensions", () => {
    assert.equal(isSupported("file.txt"), false);
    assert.equal(isSupported("file.mp4"), false);
    assert.equal(isSupported("file.zip"), false);
    assert.equal(isSupported("file"), false);
  });

  it("should be case insensitive", () => {
    assert.equal(isSupported("file.PDF"), true);
    assert.equal(isSupported("file.Docx"), true);
    assert.equal(isSupported("file.JPEG"), true);
  });

  it("should return correct mime types", () => {
    assert.equal(getMimeType("file.pdf"), "application/pdf");
    assert.equal(getMimeType("file.png"), "image/png");
    assert.equal(getMimeType("file.csv"), "text/csv");
    assert.equal(getMimeType("file.html"), "text/html");
  });

  it("should return null for unsupported types", () => {
    assert.equal(getMimeType("file.txt"), null);
    assert.equal(getMimeType("file.mp4"), null);
  });

  it("should list all supported extensions", () => {
    const exts = getSupportedExtensions();
    assert.ok(exts.includes(".pdf"));
    assert.ok(exts.includes(".docx"));
    assert.ok(exts.includes(".png"));
    assert.ok(exts.length > 10);
  });
});
