import type { ClassFixture } from "../types";
import { cerpenClass } from "./cerpen";
import { puisiClass } from "./puisi";

/** Dummy class content by project slug. Only projects of the Kelas category have one. */
export const classFixtures: ClassFixture[] = [cerpenClass, puisiClass];
