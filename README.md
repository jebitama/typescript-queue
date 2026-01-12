# Case Study Test

### Overview
Phonetic is a new startup company. They create and sell a revolutionary smartphone, a modular smartphone. Today, they have three series of phones. They are Jaguar, Leopard, and Lion. Phonetic ambition is to become the first leader in the smartphone industry. To achieve this, they are committed to providing the best after-sale experience in the world. They offer a one-day reparation service for all their smartphone lineups (it's possible because it's a modular phone). To make this happen, they hired Dalton and Wapol as technicians in their first service center at Long Ring Long Land Street.

Dalton and Wapol have outstanding repair phone skills. Wapol can fix a phone in 20 minutes on average time. On the other hand, Dalton can fix it in 10 minutes on average time (thanks to the modular system). Phonetic's first service center opens at 7 am and closes after they don't have any customers in the queue. The service center opens service registration at 7 am and closes at 9 am. After registration closes, they don't accept new customers on that day.

Dalton and Wapol started working at 9 am after registration closed. They will call customers by queue number. After finished repairing the phone, Dalton and Wapol will work on the next queue. So, customers don't know who will repair their phones.

1. Dalton and Wapol work simultaneously. So, if Dalton works for 1st customer in the queue, then Wapol works for 2nd customer in queue.
2. After Dalton/Wapol have finished, they will call the next available customer. They don't wait for each other to process the next customer.


### Task
Create a small CLI app that simulates the process on Phonetic's first service center. The app should be:

1. Can be run.
2. Simulate the waiting time each time Dalton and Wapol work. 20 minutes becomes 25 seconds for Wapol and 10 minutes becomes 15 seconds for Dalton.
3. Customers in the queue are 10 customers. Each of them has a different phone series (you can create a randomizer function).
4. Process transition should be printed on the terminal.
5. All processes on that day (technician repair who and what phone series) must be printed on the end of the app.
6. Use available codes, you can modify available classes (add/change method or attribute is okay).
7. Use recursion is mandatory
8. Write unit test for the functions. Unit test can be run by using `yarn test`.
9. The code is typescript code. So, using type is better than `any`.



##### Additional
Install dependencies first `yarn` or `yarn install`
Please use `yarn build` to build typescript file and `yarn start` to run it.

Also, see files on the example folder for more informations (expected results).


###### 
There are 3 version of this usecase
1. Use recursion as it required to start run `yarn start`
2. Use standart loop you can start by running `yarn no-recursive`
3. Use RabbitMQ style to handle failure and retry  `yarn with failure`
