import { flowA } from "./flow-a-id";
import { flowB } from "./flow-b-id";
import { flowC } from "./flow-c-id";

/** Participant flow copy (register, pay, cancel, submit, revise, status, My projects). */
export const projectsFlow = { ...flowA, ...flowB, ...flowC };
