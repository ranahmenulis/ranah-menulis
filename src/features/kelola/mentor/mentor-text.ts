import type { ClassAccess } from "./mentor-access";

export const blockedClassMessage: Record<Exclude<ClassAccess, "ok">, string> = {
  "tidak-ditugaskan": "Kelas ini tidak ditugaskan kepadamu.",
  "bukan-kelas": "Ini bukan kelas, jadi tidak dikelola dari sini.",
};
