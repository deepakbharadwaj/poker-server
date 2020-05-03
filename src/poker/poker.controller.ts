import { Controller, Get, Post, Body, Param, Logger, Put, Res, HttpStatus, Delete } from '@nestjs/common';
import { PokerService } from './poker.service';
import { CreateTableDto, AddPlayerDto, BetDto } from './poker.dto';

@Controller('poker')
export class PokerController {
    constructor(private pokerService: PokerService) { }

    @Get('tables')
    async listTables(): Promise<string[]> {
        return this.pokerService.listTables();
    }

    @Post('table')
    async createTable(@Body() createTableDto: CreateTableDto): Promise<string> {
        return this.pokerService.createTable(
            +createTableDto.smallBlind,
            +createTableDto.bigBlind,
            +createTableDto.minPlayers,
            +createTableDto.maxPlayers,
            +createTableDto.minBuyIn,
            +createTableDto.maxBuyIn,
            createTableDto.playerName,
            +createTableDto.chips
        );
    }

    @Get(':tableId/players')
    async listPlayers(@Param('tableId') tableId: string): Promise<any> {
        const players = this.pokerService.getPlayers(tableId);
        Logger.log(`players result: ${players}`);
        return players;
    }

    @Post(':tableId/addPlayer')
    async addPlayer(@Param('tableId') tableId: string, @Body() addPlayerDto: AddPlayerDto): Promise<string[]> {
        const result = this.pokerService.addPlayer(tableId, addPlayerDto.name, +addPlayerDto.chips);
        Logger.log(`addPlayer result: ${result}`);
        return this.pokerService.getPlayers(tableId);
    }

    @Delete(':tableId/addPlayer/:playerName')
    async deletePlayer(@Param('tableId') tableId: string, @Param('playerName') playerName: string): Promise<string[]> {
        const result = this.pokerService.removePlayer(tableId, playerName);
        Logger.log(`addPlayer result: ${result}`);
        return this.pokerService.getPlayers(tableId);
    }

    @Put(':tableId/player/:playerName/start')
    async startGame(@Param('tableId') tableId: string, @Param('playerName') playerName: string): Promise<any> {
        const result = this.pokerService.startGame(tableId, playerName);
        Logger.log(`startGame result: ${result}`);
        return result;
    }

    @Put(':tableId/player/:playerName/round')
    async newRound(@Param('tableId') tableId: string, @Param('playerName') playerName: string): Promise<any> {
        const result = this.pokerService.newRound(tableId, playerName);
        Logger.log(`newRound result: ${result}`);
        return result;
    }

    @Get(':tableId/player/:playerName/hand')
    async gethand(@Param('tableId') tableId: string, @Param('playerName') playerName: string): Promise<any> {
        const result = this.pokerService.getHandForPlayerName(tableId, playerName);
        Logger.log(`getHand result: ${result}`);
        return result;
    }

    @Get(':tableId/deal')
    async getDeal(@Param('tableId') tableId: string): Promise<any> {
        const result = this.pokerService.getDeal(tableId);
        Logger.log(`getDeal result: ${result}`);
        return result;
    }

    @Get(':tableId/currentPlayer')
    async getCurrentPlayer(@Param('tableId') tableId: string): Promise<any> {
        const result = this.pokerService.getCurrentPlayer(tableId);
        Logger.log(`getCurrentPlayer result: ${result}`);
        return result;
    }

    @Get(':tableId/roundName')
    async getRoundName(@Param('tableId') tableId: string): Promise<any> {
        const result = this.pokerService.getRoundName(tableId);
        Logger.log(`getRoundName result: ${result}`);
        return result;
    }

    @Get(':tableId/pot')
    async getPot(@Param('tableId') tableId: string): Promise<any> {
        const result = this.pokerService.getPot(tableId);
        Logger.log(`getPot result: ${result}`);
        return result;
    }

    @Get(':tableId/player/:playerName/pot')
    async getPlayerPot(@Param('tableId') tableId: string, @Param('playerName') playerName: string): Promise<any> {
        const result = this.pokerService.getPlayerPot(tableId, playerName);
        Logger.log(`getPlayerPot result: ${result}`);
        return result;
    }

    @Get(':tableId/lastAction')
    async getPreviousPlayerAction(@Param('tableId') tableId: string): Promise<any> {
        const result = this.pokerService.getPreviousPlayerAction(tableId);
        Logger.log(`getPreviousPlayerAction result: ${result}`);
        return result;
    }

    @Get(':tableId/allHands')
    async getAllHands(@Param('tableId') tableId: string): Promise<any> {
        const result = this.pokerService.getAllHands(tableId);
        Logger.log(`getAllHands result: ${result}`);
        return result;
    }

    @Put(':tableId/player/:playerName/check')
    async check(@Param('tableId') tableId: string, @Param('playerName') playerName: string): Promise<any> {
        const result = this.pokerService.check(tableId, playerName);
        Logger.log(`check result: ${result}`);
        return result;
    }

    @Put(':tableId/player/:playerName/fold')
    async fold(@Param('tableId') tableId: string, @Param('playerName') playerName: string): Promise<any> {
        const result = this.pokerService.fold(tableId, playerName);
        Logger.log(`fold result: ${result}`);
        return result;
    }

    @Put(':tableId/player/:playerName/call')
    async call(@Param('tableId') tableId: string, @Param('playerName') playerName: string): Promise<any> {
        const result = this.pokerService.call(tableId, playerName);
        Logger.log(`call result: ${result}`);
        return result;
    }

    @Put(':tableId/player/:playerName/call')
    async bet(@Param('tableId') tableId: string, @Param('playerName') playerName: string, @Body() betDto: BetDto): Promise<any> {
        const result = this.pokerService.bet(tableId, playerName, +betDto.amount);
        Logger.log(`bet result: ${result}`);
        return result;
    }

    @Get(':tableId/result')
    async getWinners(@Param('tableId') tableId: string): Promise<any> {
        const winners = this.pokerService.getWinners(tableId);
        Logger.log(`getWinners result: ${winners}`);
        const losers = this.pokerService.getLosers(tableId);
        Logger.log(`getWinners result: ${losers}`);
        return {
            winners,
            losers
        };
    }

}
