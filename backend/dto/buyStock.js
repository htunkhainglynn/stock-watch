class BuyStockDto {
    constructor(req) {
        this.symbol = String(req['symbol']);
        this.quantity = Number(req['quantity']);
        this.user = String(req['user']);
    }
}

module.exports = BuyStockDto;
