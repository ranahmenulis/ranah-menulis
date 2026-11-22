import { flowA } from "./flow-a-en";
import { flowB } from "./flow-b-en";
import { flowC } from "./flow-c-en";
import type { projectsFlow as source } from "./flow-id";

export const projectsFlow: typeof source = { ...flowA, ...flowB, ...flowC };
