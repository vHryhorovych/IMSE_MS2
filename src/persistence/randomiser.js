export const smapleNTimes = (arr, n) => {
  const samples = [];
  while (samples.length < n) {
    const num = Math.floor(Math.random() * arr.length);
    if (!samples.includes(num)) samples.push(num);
  }
  return samples.map((i) => arr[i]);
};
