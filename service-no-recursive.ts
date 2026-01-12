import { ServiceCenterWithoutRecursion, Technician , Customer} from './service';

// ====================================================================================
// MAIN
// ====================================================================================

// Define Technician
const dalton = new Technician('Dalton', 10); // 10 seconds
const wapol = new Technician('Wapol', 20); // 20 seconds
const technicians = [dalton, wapol];

// Define Customer (generate 10)
const phoneSeriesList = ['Lion', 'Cat', 'Crocodile', 'Tiger', 'Eagle'];

const customers = new Array(10).fill(null).map((_, index) => {
  return new Customer(
    `Customer ${index + 1}`,
    phoneSeriesList[index % phoneSeriesList.length]
  );
});

// Define Service Center
const serviceCenter = new ServiceCenterWithoutRecursion(
  'Second Service Center',
  'Long Ring Long Land Street',
  technicians,
  customers
);

console.log('Customer on queue: ');
console.table(
  customers.map((c) => ({
    Customer: c.name,
    PhoneSeries: c.phoneSeries,
  }))
);
console.log('\n');

// Begin Operating
console.log(`${serviceCenter.name} start operating today:\n`);

// without recursive iterate enough (better approach)
serviceCenter.startOperatingWithoutRecursive().catch(console.error);
