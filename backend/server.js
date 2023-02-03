"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
// --- Constants --- //
const FOOD_REFILL_THRESHOLD = 10;
const LOGGING = false;
// --- Types, and enums  --- //
// A typerscript enum that represents the size of a food box (single, couple, family, large family)
var FoodBoxSize;
(function (FoodBoxSize) {
    FoodBoxSize["LARGE_FAMILY"] = "large_family";
    FoodBoxSize["SINGLE"] = "single";
    FoodBoxSize["COUPLE"] = "couple";
    FoodBoxSize["LARGE"] = "large";
})(FoodBoxSize || (FoodBoxSize = {}));
// --- Util functions --- //
/**
 *
 * @param mean
 * @param min
 * @param max
 * @returns A random number between min and max, with a mean of mean
 */
function generateRandom(mean, min, max) {
    let randomNumber = 0;
    for (let i = 0; i < 6; i += 1) {
        randomNumber += Math.random();
    }
    return Math.round(Math.max(min, Math.min(max, mean + (randomNumber - 3))));
}
/**
 * @param size - The size of the food box
 * @param probabilities - The probabilities of each type of household
 * @returns The number of referrals for a single box
 */
function simulateNumberOfBoxReferrals(size, probabilities) {
    switch (size) {
        case FoodBoxSize.LARGE_FAMILY:
            return Math.floor(Math.random() * 100 * probabilities.single);
        case FoodBoxSize.LARGE:
            return Math.floor(Math.random() * 100 * probabilities.largeFamily);
        case FoodBoxSize.COUPLE:
            return Math.floor(Math.random() * 100 * probabilities.couple);
        case FoodBoxSize.SINGLE:
            return Math.floor(Math.random() * 100 * probabilities.single);
    }
}
// -- Classes -- //
class FoodBox {
    /**
    * @param {FoodBoxSize} size - The size of the food box
    * @param {number} daysUntilExpiry - The number of days until the food box expires
    */
    constructor(size) {
        this.size = size;
        this.daysUntilExpiry = generateRandom(5, 2, 8);
    }
}
class FoodBank {
    /**
     * @param {number} numberOfBoxesToRestock - The number of deliveries to refill a low box size inventory with
     * @param {BoxCategories} probabilities - The probabilities of each type of box having a referral (0 - 1)
     */
    constructor(numberOfBoxesToRestock, probabilities) {
        this.currentDate = new Date();
        this.averageNumberOfDeliveriesPerDay = 0;
        this.daysPassed = 0;
        this.isOpen = true;
        this.probablities = probabilities;
        this.numberOfBoxesToRestock = numberOfBoxesToRestock;
        this.currentInventoryOfBoxesOfFood = [];
        this.referralsToday = {
            single: 0,
            couple: 0,
            family: 0,
            largeFamily: 0,
        };
        this.deliveriesToday = {
            single: 0,
            couple: 0,
            family: 0,
            largeFamily: 0,
        };
        this.numberOfExpiredBoxesOfFood = 0;
        this.numberOfUnfulfilledReferrals = 0;
    }
    setFoodBankOpenState() {
        if (this.currentDate.getDay() === 0 || this.currentDate.getDay() === 6 || this.currentDate.getDay() === 5) {
            this.isOpen = false;
        }
        else {
            this.isOpen = true;
        }
    }
    getNumberOFBoxesOfFoodInInventory(size) {
        return this.currentInventoryOfBoxesOfFood.filter(box => box.size === size).length;
    }
    removeExpiredBoxesOfFoodFromInventory() {
        for (let j = 0; j < this.currentInventoryOfBoxesOfFood.length; j++) {
            this.currentInventoryOfBoxesOfFood[j].daysUntilExpiry -= 1;
            if (this.currentInventoryOfBoxesOfFood[j].daysUntilExpiry <= 0) {
                this.currentInventoryOfBoxesOfFood.splice(j, 1);
                this.numberOfExpiredBoxesOfFood += 1;
                j -= 1;
            }
        }
    }
    removeReferredBoxesFromInventory() {
        for (let j = 0; j < this.referralsToday.single; j++) {
            // if single boxes have ran out of stock, add the number of unfulfilled referrals, else remove a single box from the inventory
            if (this.currentInventoryOfBoxesOfFood.filter(box => box.size === FoodBoxSize.SINGLE).length === 0) {
                this.numberOfUnfulfilledReferrals += 1;
            }
            else {
                // find a single box in the inventory and remove it
                for (let k = 0; k < this.currentInventoryOfBoxesOfFood.length; k++) {
                    if (this.currentInventoryOfBoxesOfFood[k].size === FoodBoxSize.SINGLE) {
                        this.currentInventoryOfBoxesOfFood.splice(k, 1);
                        break;
                    }
                }
            }
        }
        for (let j = 0; j < this.referralsToday.couple; j++) {
            if (this.currentInventoryOfBoxesOfFood.filter(box => box.size === FoodBoxSize.COUPLE).length === 0) {
                this.numberOfUnfulfilledReferrals += 1;
            }
            else {
                // find a couple box in the inventory and remove it
                for (let k = 0; k < this.currentInventoryOfBoxesOfFood.length; k++) {
                    if (this.currentInventoryOfBoxesOfFood[k].size === FoodBoxSize.COUPLE) {
                        this.currentInventoryOfBoxesOfFood.splice(k, 1);
                        break;
                    }
                }
            }
        }
        for (let j = 0; j < this.referralsToday.family; j++) {
            if (this.currentInventoryOfBoxesOfFood.filter(box => box.size === FoodBoxSize.LARGE).length === 0) {
                this.numberOfUnfulfilledReferrals += 1;
            }
            else {
                // find a family box in the inventory and remove it
                for (let k = 0; k < this.currentInventoryOfBoxesOfFood.length; k++) {
                    if (this.currentInventoryOfBoxesOfFood[k].size === FoodBoxSize.LARGE) {
                        this.currentInventoryOfBoxesOfFood.splice(k, 1);
                        break;
                    }
                }
            }
        }
        for (let j = 0; j < this.referralsToday.largeFamily; j++) {
            if (this.currentInventoryOfBoxesOfFood.filter(box => box.size === FoodBoxSize.LARGE_FAMILY).length === 0) {
                this.numberOfUnfulfilledReferrals += 1;
            }
            else {
                // find a large family box in the inventory and remove it
                for (let k = 0; k < this.currentInventoryOfBoxesOfFood.length; k++) {
                    if (this.currentInventoryOfBoxesOfFood[k].size === FoodBoxSize.LARGE_FAMILY) {
                        this.currentInventoryOfBoxesOfFood.splice(k, 1);
                        break;
                    }
                }
            }
        }
    }
    resetDayilyStats() {
        // reset the number of boxes of food that are delivered, referred
        this.deliveriesToday.single = 0;
        this.deliveriesToday.couple = 0;
        this.deliveriesToday.family = 0;
        this.deliveriesToday.largeFamily = 0;
        this.referralsToday.single = 0;
        this.referralsToday.couple = 0;
        this.referralsToday.family = 0;
        this.referralsToday.largeFamily = 0;
    }
    // function which simulates the state of the food bank over a period of time after a number of days
    simulateFoodBankRunFor(days) {
        for (let i = 0; i < days; i++) {
            // increment the current day & determine whether the food bank is open
            this.currentDate.setDate(this.currentDate.getDate() + 1);
            this.setFoodBankOpenState();
            // simulate the number of boxes of food that are delivered to the food bank, assuming that the number of boxes of food that are delivered is constant for each day
            // only add deliveries if the food bank 4 days out of the week
            if (this.isOpen) {
                const numberOfSingleBoxesOfFood = this.getNumberOFBoxesOfFoodInInventory(FoodBoxSize.SINGLE);
                const numberOfCoupleBoxesOfFood = this.getNumberOFBoxesOfFoodInInventory(FoodBoxSize.LARGE);
                const numberOfFamilyBoxesOfFood = this.getNumberOFBoxesOfFoodInInventory(FoodBoxSize.COUPLE);
                const numberOfLargeFamilyBoxesOfFood = this.getNumberOFBoxesOfFoodInInventory(FoodBoxSize.LARGE_FAMILY);
                // if we're running low on food, add deliveries
                if (numberOfSingleBoxesOfFood < FOOD_REFILL_THRESHOLD) {
                    this.deliveriesToday.single = this.numberOfBoxesToRestock;
                }
                if (numberOfCoupleBoxesOfFood < FOOD_REFILL_THRESHOLD) {
                    this.deliveriesToday.couple = this.numberOfBoxesToRestock;
                }
                if (numberOfFamilyBoxesOfFood < FOOD_REFILL_THRESHOLD) {
                    this.deliveriesToday.family = this.numberOfBoxesToRestock;
                }
                if (numberOfLargeFamilyBoxesOfFood < FOOD_REFILL_THRESHOLD) {
                    this.deliveriesToday.largeFamily = this.numberOfBoxesToRestock;
                }
            }
            else {
                this.deliveriesToday.single = 0;
                this.deliveriesToday.couple = 0;
                this.deliveriesToday.family = 0;
                this.deliveriesToday.largeFamily = 0;
            }
            // add the new boxes of food to the food bank's inventory
            for (let j = 0; j < this.deliveriesToday.single; j++) {
                this.currentInventoryOfBoxesOfFood.push(new FoodBox(FoodBoxSize.SINGLE));
            }
            for (let j = 0; j < this.deliveriesToday.couple; j++) {
                this.currentInventoryOfBoxesOfFood.push(new FoodBox(FoodBoxSize.COUPLE));
            }
            for (let j = 0; j < this.deliveriesToday.family; j++) {
                this.currentInventoryOfBoxesOfFood.push(new FoodBox(FoodBoxSize.LARGE));
            }
            for (let j = 0; j < this.deliveriesToday.largeFamily; j++) {
                this.currentInventoryOfBoxesOfFood.push(new FoodBox(FoodBoxSize.LARGE_FAMILY));
            }
            // simulate the number of boxes of food that are referred (and thus collected from the food bank)
            // only register referrals if the food bank is open
            if (this.isOpen) {
                this.referralsToday.single = simulateNumberOfBoxReferrals(FoodBoxSize.SINGLE, this.probablities);
                this.referralsToday.couple = simulateNumberOfBoxReferrals(FoodBoxSize.COUPLE, this.probablities);
                this.referralsToday.family = simulateNumberOfBoxReferrals(FoodBoxSize.LARGE, this.probablities);
                this.referralsToday.largeFamily = simulateNumberOfBoxReferrals(FoodBoxSize.LARGE_FAMILY, this.probablities);
            }
            else {
                this.referralsToday.single = 0;
                this.referralsToday.couple = 0;
                this.referralsToday.family = 0;
                this.referralsToday.largeFamily = 0;
            }
            // remove the boxes of food that have expired from the food bank's inventory
            this.removeExpiredBoxesOfFoodFromInventory();
            // remove the boxes of food that are referred from the food bank's inventory
            this.removeReferredBoxesFromInventory();
            if (LOGGING) {
                // print the current state of the food bank
                console.log(`\nDay ${i + 1}:`);
                console.log(`\tFood bank is open: ${this.isOpen}`);
                console.log(`\tDate: ${this.currentDate.toDateString()}`);
                console.log(`\tNumber of boxes of food delivered today: ${this.deliveriesToday.single} single, ${this.deliveriesToday.couple} couple, ${this.deliveriesToday.family} family, ${this.deliveriesToday.largeFamily} large family`);
                console.log(`\tNumber of boxes of food referred today: ${this.referralsToday.single} single, ${this.referralsToday.couple} couple, ${this.referralsToday.family} family, ${this.referralsToday.largeFamily} large family`);
                console.log(`\tTotal Number of boxes of food expired: ${this.numberOfExpiredBoxesOfFood}`);
                console.log(`\tCurrent Number of boxes of food in inventory: ${this.currentInventoryOfBoxesOfFood.length}`);
                console.log(this.currentInventoryOfBoxesOfFood);
            }
            // number of boxes that expired today
            const numberOfExpiredBoxesOfFoodToday = this.currentInventoryOfBoxesOfFood.filter(box => box.daysUntilExpiry === 0).length;
            // number boxes that will expire tomorrow
            const numberOfBoxesOfFoodThatWillExpireTomorrow = this.currentInventoryOfBoxesOfFood.filter(box => box.daysUntilExpiry === 1).length;
            if (LOGGING) {
                console.log(`\tNumber of boxes of food that expired today: ${numberOfExpiredBoxesOfFoodToday}`);
                console.log(`\tNumber of boxes of food that will expire tomorrow: ${numberOfBoxesOfFoodThatWillExpireTomorrow}`);
            }
            this.averageNumberOfDeliveriesPerDay = (this.averageNumberOfDeliveriesPerDay * i + this.deliveriesToday.single + this.deliveriesToday.couple + this.deliveriesToday.family + this.deliveriesToday.largeFamily) / (i + 1);
            if (LOGGING) {
                console.log(`\tavg number of deliveries per day: ${Math.round(this.averageNumberOfDeliveriesPerDay * 100) / 100}`);
                console.log(`\tnumber of unfulfilled referrals: ${this.numberOfUnfulfilledReferrals}`);
                console.log('\n');
            }
            this.resetDayilyStats();
            // increment the number of days that have passed
            this.daysPassed += 1;
        }
        // return the state of the simulation
        return {
            numberOfUnfulfilledReferrals: this.numberOfUnfulfilledReferrals,
            averageNumberOfDeliveriesPerDay: this.averageNumberOfDeliveriesPerDay,
            currentInventoryOfBoxesOfFood: this.currentInventoryOfBoxesOfFood,
            currentDate: this.currentDate,
            daysPassed: this.daysPassed,
            numberOfExpiredBoxesOfFood: this.numberOfExpiredBoxesOfFood,
        };
    }
}
const PORT = process.env.PORT || 3001;
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get('/healthz', (req, res) => {
    res.send({ status: 'ok' });
});
app.post('/api/simulation', (req, res) => {
    const { numberOfDays, numberOfSimulations, restockQuantity, referralProbabilities } = req.body;
    console.log(req.body);
    let avgNumberOfUnfulfilledReferrals = 0;
    let avgNumberOfDeliveriesPerDay = 0;
    let avgNumberOfExpiredBoxesOfFood = 0;
    for (let i = 0; i < numberOfSimulations; i++) {
        const foodBank = new FoodBank(restockQuantity, referralProbabilities);
        const endstate = foodBank.simulateFoodBankRunFor(numberOfDays);
        avgNumberOfUnfulfilledReferrals += endstate.numberOfUnfulfilledReferrals;
        avgNumberOfDeliveriesPerDay += endstate.averageNumberOfDeliveriesPerDay;
        avgNumberOfExpiredBoxesOfFood += endstate.numberOfExpiredBoxesOfFood;
        console.log(`\t${i + 1} of ${numberOfSimulations} simulations completed...`);
    }
    res.send({
        avgNumberOfUnfulfilledReferrals: avgNumberOfUnfulfilledReferrals / numberOfSimulations,
        avgNumberOfDeliveriesPerDay: Math.round(avgNumberOfDeliveriesPerDay / numberOfSimulations * 100) / 100,
        avgNumberOfExpiredBoxesOfFood: Math.round(avgNumberOfExpiredBoxesOfFood / numberOfSimulations * 100) / 100,
    });
});
app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
