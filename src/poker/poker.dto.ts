export class CreateTableDto {
    smallBlind: Number;
    bigBlind: Number;
    minPlayers: Number;
    maxPlayers: Number;
    minBuyIn: Number;
    maxBuyIn: Number;
    playerName: string;
    chips: Number;
}

export class AddPlayerDto {
    name: string;
    chips: Number;
}

export class BetDto {
    amount: Number;
}