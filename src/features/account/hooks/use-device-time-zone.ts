"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_TIME_ZONE, deviceTimeZone } from "../timezones";

const subscribe = () => () => {};

/** The device's time zone; the default while rendering on the server, so hydration matches. */
export function useDeviceTimeZone(): string {
  return useSyncExternalStore(subscribe, deviceTimeZone, () => DEFAULT_TIME_ZONE);
}
