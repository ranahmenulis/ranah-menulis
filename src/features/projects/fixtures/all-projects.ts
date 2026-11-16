import type { ProjectFixture } from "../types";
import { antologiFixtures } from "./antologi";
import { lombaFixtures } from "./lomba";
import { soloKelasFixtures } from "./solo-kelas";

/** Catalog order: Antologi, Solo, Kelas Menulis, Lomba. */
export const projectFixtures: ProjectFixture[] = [
  ...antologiFixtures,
  ...soloKelasFixtures,
  ...lombaFixtures,
];
