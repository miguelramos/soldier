import { getCpuTimes, getCpuUsage, getMemoryUsage } from '../lib/utils';

describe(' > Utils', () => {
  it('# Should get cpu times', () => {
    const cpuTimes = getCpuTimes();

    expect(cpuTimes.idle > 0).toBeTruthy();
    expect(cpuTimes.nice >= 0).toBeTruthy();
    expect(cpuTimes.sys > 0).toBeTruthy();
    expect(cpuTimes.user > 0).toBeTruthy();
  });

  it('# Should get cpu percent', () => {
    const cpuUsage = getCpuUsage();
    console.log(cpuUsage);
    expect(cpuUsage >= 0).toBeTruthy();
  });

  it('# Should get memory percent', () => {
    const memUsage = getMemoryUsage();

    expect(memUsage > 0).toBeTruthy();
  });
});