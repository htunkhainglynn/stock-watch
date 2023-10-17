class BuyStockDto {
    constructor(req) {
        this.symbol = String(req['symbol']);
        this.quantity = Number(req['quantity']);
        this.userId = String(req['userId']);
    }
}

module.exports = BuyStockDto;
