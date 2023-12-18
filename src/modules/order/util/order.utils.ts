export const generateOrderNumber = (count: number) => {
    // number of digits matches ##-**-@@-&&&&, where ## is 100 - the year last 2 digits, ** is 100 - the month, @@ is 100 - the day, &&&& is the number of the order in that day 
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    // order number is the count of orders created today + 1 with 4 digits and leading zeros
    const orderNumber = (count + 1).toString().padStart(4, '0');
    return `${100 - parseInt(year)}${100 - parseInt(month)}${100 - parseInt(day)}${orderNumber}`;
}