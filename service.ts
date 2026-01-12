// service.ts
export class Technician {
    private _name: string;
    private _averageRepairTime: number;
    private _isBusy = false;

    constructor(name: string, averageRepairTime: number) {
        this._name = name;
        this._averageRepairTime = averageRepairTime;
    }

    public get name() {
        return this._name;
    }

    public get isBusy() {
        return this._isBusy;
    }

    public async repairing(customer: Customer): Promise<Customer> {
        this._isBusy = true;
        console.log(
            `${this._name} is repairing ${customer.name}'s phone, ` +
            `${customer.name}'s phone is ${customer.phoneSeries} Series`
        );

        return new Promise<Customer>((resolve) => {
            setTimeout(() => {
                this._isBusy = false;
                console.log(
                `✅ Repairing done: ${this._name} finished ${customer.name}'s phone`
                );
                resolve(customer);
            }, this._averageRepairTime * 1000);
        });
    }
}

export class Customer {
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

export class ServiceCenter {
    private _name: string;
    private _address: string;
    private _technicians: Technician[];
    private _customers: Customer[];

    constructor(name: string, address: string, technicians: Technician[], customers: Customer[]) {
        this._name = name;
        this._address = address;
        this._technicians = technicians;
        this._customers = customers;
    }

    // log memory usage
    private get logMemory() {
        const used = process.memoryUsage().heapUsed;
        return `${(used / 1024 / 1024).toFixed(2)} MB`;
    }

    public get name() {
        return this._name;
    }

    public async startOperating() {
        await Promise.all(
            this._technicians.map((t) => this.runTechnician(t))
        );

        console.log('\nService center closed.');
    }

    private async runTechnician(
        technician: Technician
    ): Promise<void> {
       const customer = this._customers.shift();

        // If no customer, no calling
        if (!customer) return;

        // Calling happens only after a customer is confirmed
        console.log(`${technician.name} available, calling ${customer.name}...`);
        // log current state of repair
        console.table([
            {
                Customer: customer.name,
                PhoneSeries: customer.phoneSeries,
                RepairedBy: technician.name,
            },
        ]);

        // Wait for repair
        await technician.repairing(customer);

        // log memory usage
        console.log('Memory Usage:', this.logMemory);

        // RECURSION version will add calling Stack frames accumulated if non async function
        // but in this case still fine since it using async so it is not acumulated and in low data size
        // this approach is not recommended in a bigger customer size since can cause not predictable spike
        return this.runTechnician(technician);
    }
}

export class ServiceCenterWithoutRecursion {
    private _name: string;
    private _address: string;
    private _technicians: Technician[];
    private _customers: Customer[];

    constructor(name: string, address: string, technicians: Technician[], customers: Customer[]) {
        this._name = name;
        this._address = address;
        this._technicians = technicians;
        this._customers = customers;
    }
    
    // log memory usage 
    private get logMemory() {
        const used = process.memoryUsage().heapUsed;
        return `${(used / 1024 / 1024).toFixed(2)} MB`;
    }

    public get name() {
        return this._name;
    }

    public async startOperatingWithoutRecursive() {
        await Promise.all(
            this._technicians.map((t) => this.runTechnicianWithoutRecursive(t))
        );
        console.log('\nService center closed.');
    }

    private async runTechnicianWithoutRecursive(
        technician: Technician
    ): Promise<void> {
        while (true) {
            const customer = this._customers.shift();

            // If no customer, no calling
            if (!customer) return;

            // Calling happens only after a customer is confirmed
            console.log(`${technician.name} available, calling ${customer.name}...`);
            // log current state of repair
            console.table([
                {
                    Customer: customer.name,
                    PhoneSeries: customer.phoneSeries,
                    RepairedBy: technician.name,
                },
            ]);

            // Wait for repair
            await technician.repairing(customer);

            // log memory usage
            console.log('Memory Usage:', this.logMemory);
        }
    }
}
