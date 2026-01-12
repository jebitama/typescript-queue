import { Technician, Customer, ServiceCenter } from '../service';

describe('ServiceCenter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'table').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  // msin queue test
  it('processes all customers and closes', async () => {
    const tech = new Technician('Dalton', 1); // non-zero delay

    const customers = [
      new Customer('Customer 1', 'Lion'),
      new Customer('Customer 2', 'Cat'),
    ];

    const serviceCenter = new ServiceCenter(
      'Test Center',
      'Test Address',
      [tech],
      customers
    );

    const runPromise = serviceCenter.startOperating();

    // Customer 1 repair
    await jest.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    // Customer 2 repair
    await jest.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    await runPromise;

    expect(customers.length).toBe(0);
  });

  // 
  it('technician toggles busy state', async () => {
    const tech = new Technician('Dalton', 1);
    const customer = new Customer('Customer 1', 'Lion');

    const promise = tech.repairing(customer);

    expect(tech.isBusy).toBe(true);

    await jest.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    await promise;

    expect(tech.isBusy).toBe(false);
  });

});
