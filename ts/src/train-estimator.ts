import {ApiException, DiscountCard, InvalidTripInputException, TripRequest} from "./model/trip.request";

export class TrainTicketEstimator {

    async estimate(trainDetails: TripRequest): Promise<number> {
        if (trainDetails.passengers.length === 0) {
            return 0;
        }

        if (trainDetails.details.from.trim().length === 0) {
            throw new InvalidTripInputException("Start city is invalid");
        }

        if (trainDetails.details.to.trim().length === 0) {
            throw new InvalidTripInputException("Destination city is invalid");
        }

        if (trainDetails.details.when < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDay(), 0, 0, 0)) {
            throw new InvalidTripInputException("Date is invalid");
        }

        // TODO USE THIS LINE AT THE END
        const fetchPrice = (await(await fetch(`https://sncf.com/api/train/estimate/price?from=${trainDetails.details.from}&to=${trainDetails.details.to}&date=${trainDetails.details.when}`)).json())?.price || -1;

        if (fetchPrice === -1) {
            throw new ApiException();
        }

        const pasengers = trainDetails.passengers;
        let totalPrice = 0;
        let priceBeforeDiscount = fetchPrice;
        for (let i=0;i<pasengers.length;i++) {

            if (pasengers[i].age < 0) {
                throw new InvalidTripInputException("Age is invalid");
            }
            if (pasengers[i].age < 1) {
                priceBeforeDiscount = 0;
            }
            // Seniors
            else if (pasengers[i].age <= 17) {
                priceBeforeDiscount = fetchPrice * 0.6;
            } else if(pasengers[i].age >= 70) {
                priceBeforeDiscount = fetchPrice * 0.8;
                if (pasengers[i].discounts.includes(DiscountCard.Senior)) {
                    priceBeforeDiscount -= fetchPrice * 0.2;
                }
            } else {
                priceBeforeDiscount = fetchPrice*1.2;
            }

            const date = new Date();
            if (trainDetails.details.when.getTime() >= date.setDate(date.getDate() +30)) {
                priceBeforeDiscount -= fetchPrice * 0.2;
            } else if (trainDetails.details.when.getTime() > date.setDate(date.getDate() -30 + 5)) {
                const date1 = trainDetails.details.when;
                const date2 = new Date();
                //https://stackoverflow.com/questions/43735678/typescript-get-difference-between-two-dates-in-days
                const diffDates = Math.abs(date1.getTime() - date2.getTime());
                const diffDays = Math.ceil(diffDates / (1000 * 3600 * 24));

                priceBeforeDiscount += (20 - diffDays) * 0.02 * fetchPrice; // I tried. it works. I don't know why.
            } else {
                priceBeforeDiscount += fetchPrice;
            }

            if (pasengers[i].age > 0 && pasengers[i].age < 4) {
                priceBeforeDiscount = 9;
            }

            if (pasengers[i].discounts.includes(DiscountCard.TrainStroke)) {
                priceBeforeDiscount = 1;
            }

            totalPrice += priceBeforeDiscount;
            priceBeforeDiscount = fetchPrice;
        }

        if (pasengers.length == 2) {
            let couple = false;
            let minor = false;
            for (let i=0;i<pasengers.length;i++) {
                if (pasengers[i].discounts.includes(DiscountCard.Couple)) {
                    couple = true;
                }
                if (pasengers[i].age < 18) {
                    minor = true;
                }
            }
            if (couple && !minor) {
                totalPrice -= fetchPrice * 0.2 * 2;
            }
        }

        if (pasengers.length == 1) {
            let midCouple = false;
            let minor = false;
            for (let i=0;i<pasengers.length;i++) {
                if (pasengers[i].discounts.includes(DiscountCard.HalfCouple)) {
                    midCouple = true;
                }
                if (pasengers[i].age < 18) {
                    minor = true;
                }
            }
            if (midCouple && !minor) {
                totalPrice -= fetchPrice * 0.1;
            }
        }

        return totalPrice;
    }
}