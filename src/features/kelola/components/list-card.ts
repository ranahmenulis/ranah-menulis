/*
 * The card around a management list (DESIGN.md 7.8): the rows keep their own bottom lines, the
 * card edge closes the list. Tables sit in `tableCardClass` and scroll inside it when too wide.
 */
export const listCardClass =
  "overflow-hidden rounded-2xl border border-line bg-surface px-5 shadow-card md:px-6 [&>li:last-child]:border-b-0";

export const tableCardClass =
  "overflow-x-auto rounded-2xl border border-line bg-surface px-5 shadow-card md:px-6 [&_tbody>tr:last-child]:border-b-0";
