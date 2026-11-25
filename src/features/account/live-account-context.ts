"use client";

import { createContext } from "react";
import type { Account } from "./account-model";

/** The signed-in account for this page, from the server's session. Null means "use the device". */
export const LiveAccountContext = createContext<Account | null>(null);
