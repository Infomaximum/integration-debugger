export const isFiniteNumber = (value: any): value is number => {
  if (typeof value === "number" && !isNaN(value) && Number.isFinite(value)) {
    return true;
  }

  return false;
};

export const isConvertedNumberToString = (value: any): value is number => {
  if (isFiniteNumber(value)) {
    return true;
  }

  if (typeof value === "string" && !isNaN(Number(value))) {
    return true;
  }

  return false;
};
