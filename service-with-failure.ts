// IN this case queue with better approach using RabbitMQ
// =======================
// Technician
// =======================
export class TechnicianStore {
  private _name: string;
  private _averageRepairTime: number;
  private _isBusy = false;

  constructor(
    name: string,
    averageRepairTime: number,
    private readonly shouldFail: () => boolean = () => Math.random() < 0.3 // Random failure (30%)
  ) {
    this._name = name;
    this._averageRepairTime = averageRepairTime;
  }

  public get name() {
    return this._name;
  }

  public async repairing(customer: CustomerStore): Promise<void> {
    this._isBusy = true;

    console.log(
      `${this._name} is repairing ${customer.name}'s phone, ` +
        `${customer.phoneSeries} Series (attempt ${customer.attempts})`
    );

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this._isBusy = false;

        // Random failure
        if (this.shouldFail()) {
          console.log(
            `❌ ${this._name} failed repairing ${customer.name}'s phone`
          );
          reject(new Error('Repair failed'));
        } else {
          console.log(
            `✅ Repairing done: ${this._name} finished ${customer.name}'s phone`
          );
          resolve();
        }
      }, this._averageRepairTime * 1000);
    });
  }
}

// =======================
// Customer (Message)
// =======================
export class CustomerStore {
  private _name: string;
  private _phoneSeries: string;
  public attempts = 0;

  constructor(name: string, phoneSeries: string) {
    this._name = name;
    this._phoneSeries = phoneSeries;
  }

  public get name() {
    return this._name;
  }

  public get phoneSeries() {
    return this._phoneSeries;
  }
}

// =======================
// ServiceCenter (Broker)
// =======================
export class ServiceCenterStore {
  private _name: string;
  private _address: string;

  private _queue: CustomerStore[] = [];
  private _retryQueue: CustomerStore[] = [];
  private _deadLetterQueue: CustomerStore[] = [];
  private _inFlight = new Map<string, CustomerStore>();

  private _technicians: TechnicianStore[];

  private readonly MAX_RETRY = 3;
  private readonly RETRY_DELAY = 3000;

  private _retryTimer?: NodeJS.Timeout;

  private get logMemory() {
    const used = process.memoryUsage().heapUsed;
    return `${(used / 1024 / 1024).toFixed(2)} MB`;
  }

  constructor(
    name: string,
    address: string,
    technicians: TechnicianStore[],
    customers: CustomerStore[]
  ) {
    this._name = name;
    this._address = address;
    this._technicians = technicians;
    this._queue = [...customers];
  }

  public get name() {
    return this._name;
  }

  public async startOperating(): Promise<void> {
    // Retry worker (like retry exchange)
    this.startRetryWorker();

    await Promise.all(
      this._technicians.map((tech) => this.runTechnician(tech))
    );

    // STOP retry worker
    if (this._retryTimer) {
      clearInterval(this._retryTimer);
    }

    console.log('\nService center closed.');
    console.log('DLQ contents:');
    console.table(
      this._deadLetterQueue.map((c) => ({
        Customer: c.name,
        Phone: c.phoneSeries,
        Attempts: c.attempts,
      }))
    );
  }

  private async runTechnician(
    technician: TechnicianStore
  ): Promise<void> {
    while (true) {
      const customer = this.deliver(technician);

      if (!customer) {
        if (this.isIdle) return;
        await this.sleep(200);
        continue;
      }

      console.log(`${technician.name} calling ${customer.name}...`);

      console.table([
        {
          Customer: customer.name,
          PhoneSeries: customer.phoneSeries,
          RepairedBy: technician.name,
        },
      ]);

      try {
        await technician.repairing(customer);
        this.ack(technician);
      } catch {
        this.nack(technician);
      }

      console.log('Memory Usage:', this.logMemory);
    }
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  // ======================
  // BROKER METHODS like RabbitMQ
  // ======================

  private deliver(technician: TechnicianStore): CustomerStore | null {
    if (this._queue.length === 0) return null;
    if (this._inFlight.has(technician.name)) return null;

    const customer = this._queue.shift()!;
    this._inFlight.set(technician.name, customer);
    return customer;
  }

  private ack(technician: TechnicianStore) {
    this._inFlight.delete(technician.name);
  }

  private nack(technician: TechnicianStore) {
    const customer = this._inFlight.get(technician.name);
    if (!customer) return;

    this._inFlight.delete(technician.name);
    customer.attempts++;

    if (customer.attempts > this.MAX_RETRY) {
      console.log(
        `${customer.name} exceeded retry limit. Sent to DLQ`
      );
      this._deadLetterQueue.push(customer);
    } else {
      console.log(
        `Retrying ${customer.name} in ${this.RETRY_DELAY / 1000}s`
      );
      this._retryQueue.push(customer);
    }
  }

  // Retry queue processor (TTL simulation)
  private startRetryWorker() {
    this._retryTimer = setInterval(() => {
      if (this._retryQueue.length > 0) {
        const customer = this._retryQueue.shift()!;
        this._queue.push(customer);
      }
    }, this.RETRY_DELAY);
  }

  private get isIdle(): boolean {
    return (
      this._queue.length === 0 &&
      this._retryQueue.length === 0 &&
      this._inFlight.size === 0
    );
  }
}

// ====================================================================================
// MAIN (safe for Jest)
// ====================================================================================

export async function main() {
  // Define Technician
  const dalton = new TechnicianStore('Dalton', 10);
  const wapol = new TechnicianStore('Wapol', 20);
  const technicians = [dalton, wapol];

  // Define Customers
  const phoneSeriesList = ['Lion', 'Cat', 'Crocodile', 'Tiger', 'Eagle'];

  const customers = new Array(10).fill(null).map((_, index) => {
    return new CustomerStore(
      `Customer ${index + 1}`,
      phoneSeriesList[index % phoneSeriesList.length]
    );
  });

  // Define Service Center
  const serviceCenter = new ServiceCenterStore(
    'Third Service Center',
    'Long Ring Long Land Street',
    technicians,
    customers
  );

  console.log('Customer on queue:');
  console.table(
    customers.map((c) => ({
      Customer: c.name,
      PhoneSeries: c.phoneSeries,
    }))
  );
  console.log('\n');

  console.log(`${serviceCenter.name} start operating today:\n`);
  await serviceCenter.startOperating();
}

// only run when executed directly (not in Jest)
const isMain =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  process.argv[1].endsWith('service-with-failure.js');

if (isMain) {
  main().catch(console.error);
}
