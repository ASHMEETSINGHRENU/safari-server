/**
 * Escape a user-supplied search term for use inside a MongoDB $regex.
 *
 * Without this, a term like `(a+)+$` is a valid catastrophic-backtracking pattern and
 * the server burns CPU on every request; unbalanced brackets also throw and 500.
 * Escaping keeps the input literal, which is what a search box wants anyway.
 */
export const regexEscape = (term) => String(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');