import {
  TechnicianStore,
  CustomerStore,
  ServiceCenterStore,
} from '../service-with-failure';

describe('ServiceCenterStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'table').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('successfully repairs all customers', async () => {
    // Technician never fails
    const technician = new TechnicianStore(
      'Tech A',
      1,
      () => false
    );

    const customers = [
      new CustomerStore('Alice', 'Lion'),
      new CustomerStore('Bob', 'Tiger'),
    ];

    const center = new ServiceCenterStore(
      'Center A',
      'Test Street',
      [technician],
      customers
    );

    const runPromise = center.startOperating();

    // repair timers
    await jest.advanceTimersByTimeAsync(1000);
    await jest.advanceTimersByTimeAsync(1000);

    // allow async loop to settle
    await Promise.resolve();

    await runPromise;

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('Service center closed')
    );
  });

  test('retries failed customer and eventually succeeds', async () => {
    let failCount = 0;

    const technician = new TechnicianStore(
      'Tech Retry',
      1,
      () => failCount++ < 1 // fail once, then succeed
    );

    const customer = new CustomerStore('Retry Guy', 'Cat');

    const center = new ServiceCenterStore(
      'Retry Center',
      'Retry Street',
      [technician],
      [customer]
    );

    const runPromise = center.startOperating();

    // first failure
    await jest.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    // retry delay
    await jest.advanceTimersByTimeAsync(3000);
    await Promise.resolve();

    // second attempt succeeds
    await jest.advanceTimersByTimeAsync(1000);
    await Promise.resolve();

    await runPromise;

    expect(customer.attempts).toBe(1);
  });

  test('moves customer to DLQ after exceeding max retry', async () => {
    const technician = new TechnicianStore(
      'Tech Fail',
      1,
      () => true // always fail
    );

    const customer = new CustomerStore('Unlucky', 'Crocodile');

    const center = new ServiceCenterStore(
      'DLQ Center',
      'Fail Street',
      [technician],
      [customer]
    );

    const runPromise = center.startOperating();

    // MAX_RETRY = 3 → 4 attempts total
    for (let i = 0; i < 4; i++) {
      await jest.advanceTimersByTimeAsync(1000); // repair
      await Promise.resolve();

      await jest.advanceTimersByTimeAsync(3000); // retry delay
      await Promise.resolve();
    }

    await runPromise;

    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('exceeded retry limit')
    );
  });
});
