import {
  Technician,
  Customer,
  ServiceCenterWithoutRecursion,
} from '../service';

describe('ServiceCenterWithoutRecursion', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('processes all customers sequentially and stops', async () => {
    // IMPORTANT: 0 seconds = no timers for test
    const technician = new Technician('Tech A', 0);

    const customers = [
      new Customer('Alice', 'Lion'),
      new Customer('Bob', 'Tiger'),
      new Customer('Charlie', 'Eagle'),
    ];

    const center = new ServiceCenterWithoutRecursion(
      'Center A',
      'Test Address',
      [technician],
      customers
    );

    await center.startOperatingWithoutRecursive();

    expect(customers.length).toBe(0);
    expect(technician.isBusy).toBe(false);
  });

  it('handles empty customer list immediately', async () => {
    const technician = new Technician('Idle Tech', 0);

    const center = new ServiceCenterWithoutRecursion(
      'Empty Center',
      'Nowhere',
      [technician],
      []
    );

    await center.startOperatingWithoutRecursive();

    expect(technician.isBusy).toBe(false);
  });

  it('multiple technicians share the same queue safely', async () => {
    const tech1 = new Technician('Tech 1', 0);
    const tech2 = new Technician('Tech 2', 0);

    const customers = [
      new Customer('C1', 'Lion'),
      new Customer('C2', 'Cat'),
      new Customer('C3', 'Tiger'),
      new Customer('C4', 'Eagle'),
    ];

    const center = new ServiceCenterWithoutRecursion(
      'Multi Tech Center',
      'Test Street',
      [tech1, tech2],
      customers
    );

    await center.startOperatingWithoutRecursive();

    expect(customers.length).toBe(0);
    expect(tech1.isBusy).toBe(false);
    expect(tech2.isBusy).toBe(false);
  });
});
