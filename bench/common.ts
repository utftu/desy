export function runSeveralTimes(cb, times = 100) {
  for (let i = 0; i < times; i++) {
    cb();
  }
}
