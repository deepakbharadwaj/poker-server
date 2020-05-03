import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import * as Table from '../poker/poker';
import * as _ from 'lodash';

@Injectable()
export class PokerService {
    private tables = [];

    createTable(smallBlind: Number, bigBlind: Number, minPlayers: Number, maxPlayers: Number,
        minBuyIn: Number, maxBuyIn: Number, playerName: string, chips: Number) {
        var table: Table = new Table.Table(
            smallBlind,
            bigBlind,
            minPlayers,
            maxPlayers,
            minBuyIn,
            maxBuyIn
        );
        const val = Math.floor(1000 + Math.random() * 9000);
        const id: string = `${val}`;
        Logger.log(`Creating Room with id: ${id}`)
        this.tables.push({
            id,
            creator: playerName,
            handle: table
        });
        table.AddPlayer(playerName, chips);
        return id;
    }

    listTables() {
        return _.map(this.tables, t => t.id);
    }

    getTable(tableId: string) {
        return _.find(this.tables, t => { return (t.id === tableId) });
    }

    getPlayers(tableId: string): any {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return {
                'players': _.map(table.handle.players, p => p.playerName),
                'playersToAdd': _.map(table.handle.playersToAdd, p => p.playerName),
                'playersToRemove': _.map(table.handle.playersToRemove, p => p.playerName),
            };
        }
        return null;
    }

    addPlayer(tableId: string, playerName: string, chips: Number): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.AddPlayer(playerName, chips);
        }
        return false;
    }

    removePlayer(tableId: string, playerName: string): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            table.handle.RemovePlayer(playerName);
        }
        return false;
    }

    startGame(tableId: string, playerName: string): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            if (playerName === table.creator) {
                table.handle.StartGame();
                return true;
            }
            return false;
        }
        return false;
    }

    getDeal(tableId: string): any[] {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.getDeal()
        }
        return null;
    }

    getPot(tableId: string): Number {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.getPot()
        }
        return -1;
    }

    getPlayerPot(tableId: string, playerName: string): Number {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            const player = table.handle.getPlayerFromName(playerName);
            if (!_.isNil(player)) {
                return player.chips;
            }
            return null;
        }
        return null;
    }

    addChips(tableId: string, playerName: string, amount: number): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            const player = table.handle.getPlayerFromName(playerName);
            if (!_.isNil(player)) {
                player.GetChips(amount);
                return true;
            }
            return false;
        }
        return false;

    }

    getRoundName(tableId: string): string {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.getRoundName();
        }
        return null;
    }

    getHandForPlayerName(tableId: string, playerName: string): any[] {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.getHandForPlayerName(playerName)
        }
        return null;
    }

    getCurrentPlayer(tableId: string): string {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.getCurrentPlayer();
        }
        return null;
    }

    getPreviousPlayerAction(tableId: string): string {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.getPreviousPlayerAction();
        }
        return null;
    }

    getAllHands(tableId: string): any[] {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            const roundName = table.handle.getRoundName();
            if (roundName === 'Showdown') {
                return table.handle.getAllHands();
            }
            return null;
        }
        return null;
    }

    check(tableId: string, playerName: string): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.check(playerName);
        }
        return false;
    }

    fold(tableId: string, playerName: string): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.check(playerName);
        }
        return false;
    }

    call(tableId: string, playerName: string): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.check(playerName);
        }
        return false;
    }

    bet(tableId: string, playerName: string, amount: number): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            return table.handle.check(playerName, amount);
        }
        return false;
    }

    getWinners(tableId: string): any[] {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            table.handle.getWinners();
        }
        return null
    }

    getLosers(tableId: string): any[] {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            table.handle.getWinners();
        }
        return null
    }

    newRound(tableId: string, playerName: string): boolean {
        const table = this.getTable(tableId);
        if (!_.isNil(table)) {
            if (playerName === table.creator) {
                return table.handle.initNewRound();
            }
            return false;
        }
        return false;
    }
}
