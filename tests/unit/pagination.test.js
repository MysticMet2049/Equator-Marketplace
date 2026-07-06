import { describe, expect, test } from "vitest";

function getPaginationPages(currentPage, totalPages, maxVisible = 3) {
  if (totalPages <= 0) {
    return [];
  }

  const pages = [];
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  let start = Math.max(1, safeCurrentPage - 1);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  return pages;
}

describe("getPaginationPages", () => {
  test("retourne les premieres pages", () => {
    expect(getPaginationPages(1, 5)).toEqual([1, 2, 3]);
  });

  test("retourne les pages autour de la page active", () => {
    expect(getPaginationPages(3, 5)).toEqual([2, 3, 4]);
  });

  test("ne depasse pas le nombre total de pages", () => {
    expect(getPaginationPages(5, 5)).toEqual([3, 4, 5]);
  });

  test("retourne une seule page si totalPages vaut 1", () => {
    expect(getPaginationPages(1, 1)).toEqual([1]);
  });

  test("retourne une liste vide si totalPages vaut 0", () => {
    expect(getPaginationPages(1, 0)).toEqual([]);
  });
});
