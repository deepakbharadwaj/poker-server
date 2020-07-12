import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayInit,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { PokerService } from './poker.service';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

@WebSocketGateway()
export class PokerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private pokerService: PokerService) { }

    @WebSocketServer() server: Server;

    afterInit(server: Server) {
        Logger.log('Init');
    }

    handleDisconnect(client: Socket) {
        Logger.log(`Client disconnected: ${client.id}`);
    }

    handleConnection(client: Socket, ...args: any[]) {
        Logger.log(`Client connected: ${client.id}`);
    }

    @SubscribeMessage('msgToServer')
    msgToServer(client: Socket, payload: string): void {
        const payloadJson = JSON.parse(payload);
        if (payloadJson.action == 'listTables') {
            this.listTables(client);
        } else if (payloadJson.action == 'createTable') {
            this.createTable(client, payloadJson)
        } else if (payloadJson.action == 'listPlayers') {
            this.listPlayers(client, payloadJson)
        } else if (payloadJson.action == 'addPlayer') {
            this.addPlayer(client, payloadJson)
        } else if (payloadJson.action == 'removePlayer') {
            this.removePlayer(client, payloadJson)
        } else if (payloadJson.action == 'startGame') {
            this.startGame(client, payloadJson)
        } else if (payloadJson.action == 'newRound') {
            this.newRound(client, payloadJson)
        } else if (payloadJson.action == 'getHand') {
            this.getHand(client, payloadJson)
        } else if (payloadJson.action == 'getDeal') {
            this.getDeal(client, payloadJson)
        } else if (payloadJson.action == 'getCurrentPlayer') {
            this.getCurrentPlayer(client, payloadJson)
        } else if (payloadJson.action == 'getRoundName') {
            this.getRoundName(client, payloadJson)
        } else if (payloadJson.action == 'getPot') {
            this.getPot(client, payloadJson)
        } else if (payloadJson.action == 'getPlayerPot') {
            this.getPlayerPot(client, payloadJson)
        } else if (payloadJson.action == 'getPreviousPlayerAction') {
            this.getPreviousPlayerAction(client, payloadJson)
        } else if (payloadJson.action == 'getAllHands') {
            this.getAllHands(client, payloadJson)
        } else if (payloadJson.action == 'check') {
            this.check(client, payloadJson)
        } else if (payloadJson.action == 'fold') {
            this.fold(client, payloadJson)
        } else if (payloadJson.action == 'call') {
            this.call(client, payloadJson)
        } else if (payloadJson.action == 'bet') {
            this.bet(client, payloadJson)
        } else if (payloadJson.action == 'getWinners') {
            this.getWinners(client, payloadJson)
        } else {
            this.server.emit('msgToClient', JSON.stringify({ error: 'Invalid action!!!' }));
        }

    }

    listTables(client: Socket): void {
        const result = this.pokerService.listTables();
        Logger.log(`listTables result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'listTables', result }));
    }

    createTable(client: Socket, payloadJson: any): void {
        const tableId = this.pokerService.createTable(
            +payloadJson.smallBlind,
            +payloadJson.bigBlind,
            +payloadJson.minPlayers,
            +payloadJson.maxPlayers,
            +payloadJson.minBuyIn,
            +payloadJson.maxBuyIn,
            payloadJson.playerName,
            +payloadJson.chips
        );
        Logger.log(`createTable result: ${tableId}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'createTable', id: tableId }));
    }

    listPlayers(client: Socket, payloadJson: any): void {
        const players = this.pokerService.getPlayers(payloadJson.tableId);
        Logger.log(`listPlayers result: ${JSON.stringify(players)}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'listPlayers', ...players }));
    }

    addPlayer(client: Socket, payloadJson: any): void {
        const result = this.pokerService.addPlayer(payloadJson.tableId, payloadJson.name, +payloadJson.chips);
        Logger.log(`addPlayer result: ${JSON.stringify(result)}`);
        const players = this.pokerService.getPlayers(payloadJson.tableId);
        this.server.emit('msgToClient', JSON.stringify({ action: 'addPlayer', ...players }));
    }

    removePlayer(client: Socket, payloadJson: any): void {
        const result = this.pokerService.removePlayer(payloadJson.tableId, payloadJson.playerName);
        Logger.log(`removePlayer result: ${JSON.stringify(result)}`);
        const players = this.pokerService.getPlayers(payloadJson.tableId);
        this.server.emit('msgToClient', JSON.stringify({ action: 'removePlayer', ...players }));
    }

    startGame(client: Socket, payloadJson: any): void {
        const result = this.pokerService.startGame(payloadJson.tableId, payloadJson.playerName);
        Logger.log(`startGame result: ${JSON.stringify(result)}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'startGame', result }));
    }

    newRound(client: Socket, payloadJson: any): void {
        const result = this.pokerService.newRound(payloadJson.tableId, payloadJson.playerName);
        Logger.log(`newRound result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'newRound', result }));
    }

    getHand(client: Socket, payloadJson: any): void {
        const result = this.pokerService.getHandForPlayerName(payloadJson.tableId, payloadJson.playerName);
        Logger.log(`getHand result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'getHand', result }));
    }

    getDeal(client: Socket, payloadJson: any): void {
        const result = this.pokerService.getDeal(payloadJson.tableId);
        Logger.log(`getDeal result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'getDeal', result }));
    }

    getCurrentPlayer(client: Socket, payloadJson: any): void {
        const result = this.pokerService.getCurrentPlayer(payloadJson.tableId);
        Logger.log(`getCurrentPlayer result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'getCurrentPlayer', result }));
    }

    getRoundName(client: Socket, payloadJson: any): void {
        const result = this.pokerService.getRoundName(payloadJson.tableId);
        Logger.log(`getRoundName result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'getRoundName', result }));
    }

    getPot(client: Socket, payloadJson: any): void {
        const result = this.pokerService.getPot(payloadJson.tableId);
        Logger.log(`getPot result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'getPot', result }));
    }

    getPlayerPot(client: Socket, payloadJson: any): void {
        const result = this.pokerService.getPlayerPot(payloadJson.tableId, payloadJson.playerName);
        Logger.log(`getPlayerPot result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'getPlayerPot', result }));
    }

    getPreviousPlayerAction(client: Socket, payloadJson: any): void {
        const result = this.pokerService.getPreviousPlayerAction(payloadJson.tableId);
        Logger.log(`getPreviousPlayerAction result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'getPreviousPlayerAction', result }));
    }

    getAllHands(client: Socket, payloadJson: any): void {
        const result = this.pokerService.getAllHands(payloadJson.tableId);
        Logger.log(`getAllHands result: ${JSON.stringify(result)}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'getAllHands', result }));
    }

    check(client: Socket, payloadJson: any): void {
        const result = this.pokerService.check(payloadJson.tableId, payloadJson.playerName);
        Logger.log(`check result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'check', result }));
    }

    fold(client: Socket, payloadJson: any): void {
        const result = this.pokerService.fold(payloadJson.tableId, payloadJson.playerName);
        Logger.log(`fold result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'fold', result }));
    }

    call(client: Socket, payloadJson: any): void {
        const result = this.pokerService.call(payloadJson.tableId, payloadJson.playerName);
        Logger.log(`call result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'call', result }));
    }

    bet(client: Socket, payloadJson: any): void {
        const result = this.pokerService.bet(payloadJson.tableId, payloadJson.playerName, +payloadJson.amount);
        Logger.log(`bet result: ${result}`);
        this.server.emit('msgToClient', JSON.stringify({ action: 'bet', result }));
    }

    getWinners(client: Socket, payloadJson: any): void {
        const winners = this.pokerService.getWinners(payloadJson.tableId);
        Logger.log(`getWinners result: ${winners}`);
        const losers = this.pokerService.getLosers(payloadJson.tableId);
        Logger.log(`getWinners result: ${losers}`);
        const result = {
            winners,
            losers
        };
        this.server.emit('msgToClient', JSON.stringify({ action: 'getWinners', result }));
    }




}