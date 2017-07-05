// from http://www.jacklmoore.com/notes/rounding-in-javascript/
export const round = (value, decimals) => {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

// Expects an integer, returns a string with commas every 3 digits if needed.
export const formatWithCommas = (value) => {
  return value.toString()
              .split('')
              .reverse()
              .map((char, idx) => (idx%3 === 0 && idx !== 0) ? char + ',' : char)
              .reverse()
              .join("");
}
