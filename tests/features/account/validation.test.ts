import { describe, expect, it } from "vitest";
import {
  bioIssue,
  confirmIssue,
  emailIssue,
  nameIssue,
  normalizeUsername,
  passwordIssue,
  passwordPresent,
  photoIssue,
  usernameIssue,
} from "@/features/account/validation";

const free = () => false;

describe("emailIssue", () => {
  it("asks for an email, then for a well-formed one", () => {
    expect(emailIssue("")).toBe("required");
    expect(emailIssue("   ")).toBe("required");
    expect(emailIssue("rinjani")).toBe("emailInvalid");
    expect(emailIssue("rinjani@")).toBe("emailInvalid");
    expect(emailIssue("rin jani@contoh.id")).toBe("emailInvalid");
    expect(emailIssue("rinjani@contoh")).toBe("emailInvalid");
    expect(emailIssue(` rinjani@contoh.id `)).toBeNull();
    expect(emailIssue(`${"a".repeat(250)}@contoh.id`)).toBe("emailInvalid");
  });
});

describe("passwordIssue", () => {
  it("rejects short, long, and weak passwords with different reasons", () => {
    expect(passwordIssue("")).toBe("required");
    expect(passwordIssue("abc12")).toBe("passwordShort");
    expect(passwordIssue("sembilanhuruf")).toBe("passwordWeak");
    expect(passwordIssue("12345678")).toBe("passwordWeak");
    expect(passwordIssue("a1".repeat(40))).toBe("passwordLong");
    expect(passwordIssue("rahasia123")).toBeNull();
  });

  it("counts bytes for the upper limit, since bcrypt does", () => {
    // 40 two-byte letters + a digit is 41 characters but 81 bytes.
    expect(passwordIssue(`${"é".repeat(40)}1`)).toBe("passwordLong");
  });

  it("accepts letters outside Latin", () => {
    expect(passwordIssue("ꦲꦤꦕꦫꦏ1234")).toBeNull();
  });

  it("sign-in only needs something typed", () => {
    expect(passwordPresent("")).toBe("required");
    expect(passwordPresent("x")).toBeNull();
  });
});

describe("confirmIssue", () => {
  it("needs the same password twice", () => {
    expect(confirmIssue("rahasia123", "")).toBe("required");
    expect(confirmIssue("rahasia123", "rahasia124")).toBe("passwordMismatch");
    expect(confirmIssue("rahasia123", "rahasia123")).toBeNull();
  });
});

describe("usernameIssue", () => {
  it("forgives capitals and a leading @ by normalising first", () => {
    expect(normalizeUsername("  @Rinjani_Putri ")).toBe("rinjani_putri");
    expect(usernameIssue("@Rinjani_Putri", free)).toBeNull();
  });

  it("applies length, character, reserved, and taken rules in that order", () => {
    expect(usernameIssue("", free)).toBe("required");
    expect(usernameIssue("ab", free)).toBe("usernameShort");
    expect(usernameIssue("a".repeat(21), free)).toBe("usernameLong");
    expect(usernameIssue("rin jani", free)).toBe("usernameChars");
    expect(usernameIssue("rinjani-putri", free)).toBe("usernameChars");
    expect(usernameIssue("admin", free)).toBe("usernameReserved");
    expect(usernameIssue("rinjani", (name) => name === "rinjani")).toBe("usernameTaken");
    expect(usernameIssue("a".repeat(20), free)).toBeNull();
  });
});

describe("nameIssue and bioIssue", () => {
  it("requires a name and caps it by characters, not UTF-16 units", () => {
    expect(nameIssue(" ")).toBe("required");
    expect(nameIssue("Laras")).toBeNull();
    expect(nameIssue("𝒜".repeat(60))).toBeNull();
    expect(nameIssue("a".repeat(61))).toBe("nameLong");
  });

  it("lets the bio be empty and caps it at 160", () => {
    expect(bioIssue("")).toBeNull();
    expect(bioIssue("a".repeat(160))).toBeNull();
    expect(bioIssue("a".repeat(161))).toBe("bioLong");
  });
});

describe("photoIssue", () => {
  it("accepts JPG, PNG, WebP up to 2 MB", () => {
    expect(photoIssue({ type: "image/png", size: 2 * 1024 * 1024 })).toBeNull();
    expect(photoIssue({ type: "image/webp", size: 10 })).toBeNull();
    expect(photoIssue({ type: "image/gif", size: 10 })).toBe("photoType");
    expect(photoIssue({ type: "application/pdf", size: 10 })).toBe("photoType");
    expect(photoIssue({ type: "image/jpeg", size: 2 * 1024 * 1024 + 1 })).toBe("photoSize");
  });
});
