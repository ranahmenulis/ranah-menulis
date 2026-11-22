export const countries = [
  { value: "ID", label: "Indonesia" },
  { value: "MY", label: "Malaysia" },
  { value: "OTHER", label: "Lainnya" },
] as const;

export type WaitlistValues = {
  name: string;
  email: string;
  country: string;
  interests: string[];
};

export type WaitlistErrorCode = "nameRequired" | "emailRequired" | "emailInvalid";

export type WaitlistState = {
  status: "idle" | "success" | "exists" | "invalid" | "failed";
  values: WaitlistValues;
  /** Codes, not sentences: the form shows them in the reader's language. */
  errors: { name?: WaitlistErrorCode; email?: WaitlistErrorCode };
};

export const initialWaitlistState: WaitlistState = {
  status: "idle",
  values: { name: "", email: "", country: "ID", interests: [] },
  errors: {},
};
