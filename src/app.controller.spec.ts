import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { INestApplication, Logger } from '@nestjs/common';

import { PokerModule } from '../src/poker/poker.module';

describe('E2E Test', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PokerModule],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('AppController', () => {
    it(`GET /`, () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect({ 'status': 'ok' });
    });
  });


  describe('PokerController', () => {
    it(`LIST /poker/tables`, () => {
      return request(app.getHttpServer())
        .get('/poker/tables')
        .expect(200)
        .expect([]);
    });

    it(`Test Game - 3 Players`, async () => {
      const httpServer = app.getHttpServer();

      // Create Table with P1
      let response = await request(httpServer)
        .post('/poker/table')
        .send({ smallBlind: 1, bigBlind: 2, minPlayers: 2, maxPlayers: 9, minBuyIn: 100, maxBuyIn: 200, playerName: 'P1', chips: 100 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');

      const tableId = response.body.id;

      // List players
      response = await request(httpServer)
        .get(`/poker/${tableId}/players`)
        .set('Accept', 'application/json');

      expect(response.body.players.length).toEqual(1);
      expect(response.body.players[0]).toEqual('P1');
      expect(response.body.enoughPlayersToStart).toEqual(false);

      // Add player with P2
      response = await request(httpServer)
        .post(`/poker/${tableId}/addPlayer`)
        .send({ name: 'P2', chips: 100 })
        .set('Accept', 'application/json');

      expect(response.body.players.length).toEqual(2);
      expect(response.body.players[0]).toEqual('P1');
      expect(response.body.players[1]).toEqual('P2');
      expect(response.body.enoughPlayersToStart).toEqual(true);

      // Add player with P3
      response = await request(httpServer)
        .post(`/poker/${tableId}/addPlayer`)
        .send({ name: 'P3', chips: 100 })
        .set('Accept', 'application/json');

      expect(response.body.players.length).toEqual(3);
      expect(response.body.players[0]).toEqual('P1');
      expect(response.body.players[1]).toEqual('P2');
      expect(response.body.players[2]).toEqual('P3');
      expect(response.body.enoughPlayersToStart).toEqual(true);

      const players = response.body.players;

      // List players
      response = await request(httpServer)
        .get(`/poker/${tableId}/players`)
        .set('Accept', 'application/json');

      expect(response.body.players.length).toEqual(3);
      expect(response.body.players[0]).toEqual(players[0]);
      expect(response.body.players[1]).toEqual(players[1]);
      expect(response.body.players[2]).toEqual(players[2]);
      expect(response.body.enoughPlayersToStart).toEqual(true);

      // P2 try to start game and fail
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[1]}/start`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(false);

      // P3 try to start game and fail
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[2]}/start`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(false);

      // P1 try to start game and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[0]}/start`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // P1 get Hand
      response = await request(httpServer)
        .get(`/poker/${tableId}/player/${players[0]}/hand`)
        .set('Accept', 'application/json');

      Logger.log(`P1 Hand: ${response.body.result}`);
      expect(response.body.result.length).toEqual(2);
      const p1Hand = response.body.result;

      // P2 get Hand
      response = await request(httpServer)
        .get(`/poker/${tableId}/player/${players[1]}/hand`)
        .set('Accept', 'application/json');

      Logger.log(`P2 Hand: ${response.body.result}`);
      expect(response.body.result.length).toEqual(2);
      const p2Hand = response.body.result;

      // P3 get Hand
      response = await request(httpServer)
        .get(`/poker/${tableId}/player/${players[2]}/hand`)
        .set('Accept', 'application/json');

      Logger.log(`P3 Hand: ${response.body.result}`);
      expect(response.body.result.length).toEqual(2);
      const p3Hand = response.body.result;

      //-------------------- Deal --------------------//
      // Get round name
      response = await request(httpServer)
        .get(`/poker/${tableId}/roundName`)
        .set('Accept', 'application/json');

      Logger.log(`RoundName: ${response.body.result}`);
      expect(response.body.result).toEqual("Deal");

      // Get Deal and get empty.
      response = await request(httpServer)
        .get(`/poker/${tableId}/deal`)
        .set('Accept', 'application/json');

      Logger.log(`Deal: ${response.body.result}`);
      expect(response.body.result.length).toEqual(0);

      // Get Next Player => P1
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[0]);

      // // P2 try to call and fail
      // response = await request(httpServer)
      //   .put(`/poker/${tableId}/player/${players[1]}/call`)
      //   .set('Accept', 'application/json');
      // expect(response.body.result).toEqual(false);

      // P1 try to call and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[0]}/call`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // Get Next Player => P2
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[1]);

      // P2 try to call and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[1]}/call`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // Get Next Player => P3
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[2]);

      // P3 try to call and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[2]}/call`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      //-------------------- Flop --------------------//
      // Get round name
      response = await request(httpServer)
        .get(`/poker/${tableId}/roundName`)
        .set('Accept', 'application/json');

      Logger.log(`RoundName: ${response.body.result}`);
      expect(response.body.result).toEqual("Flop");

      // Get Deal and get 3 cards.
      response = await request(httpServer)
        .get(`/poker/${tableId}/deal`)
        .set('Accept', 'application/json');

      Logger.log(`Deal: ${response.body.result}`);
      expect(response.body.result.length).toEqual(3);

      // Get Next Player => P1
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[0]);

      // P1 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[0]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // Get Next Player => P2
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[1]);

      // P2 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[1]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // Get Next Player => P3
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[2]);


      // P3 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[2]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);


      //-------------------- Turn --------------------//
      // Get round name
      response = await request(httpServer)
        .get(`/poker/${tableId}/roundName`)
        .set('Accept', 'application/json');

      Logger.log(`RoundName: ${response.body.result}`);
      expect(response.body.result).toEqual("Turn");

      // Get Deal and get 4 cards.
      response = await request(httpServer)
        .get(`/poker/${tableId}/deal`)
        .set('Accept', 'application/json');

      Logger.log(`Deal: ${response.body.result}`);
      expect(response.body.result.length).toEqual(4);


      // Get Next Player => P1
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[0]);

      // P1 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[0]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // Get Next Player => P2
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[1]);

      // P2 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[1]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // Get Next Player => P3
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[2]);

      // P3 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[2]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);


      //-------------------- River --------------------//
      // Get round name
      response = await request(httpServer)
        .get(`/poker/${tableId}/roundName`)
        .set('Accept', 'application/json');

      Logger.log(`RoundName: ${response.body.result}`);
      expect(response.body.result).toEqual("River");

      // Get Deal and get 5 cards.
      response = await request(httpServer)
        .get(`/poker/${tableId}/deal`)
        .set('Accept', 'application/json');

      Logger.log(`Deal: ${response.body.result}`);
      expect(response.body.result.length).toEqual(5);


      // Get Next Player => P1
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[0]);

      // P1 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[0]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // Get Next Player => P2
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[1]);

      // P2 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[1]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);

      // Get Next Player => P3
      response = await request(httpServer)
        .get(`/poker/${tableId}/currentPlayer`)
        .set('Accept', 'application/json');

      Logger.log(`currentPlayer: ${response.body.result}`);
      expect(response.body.result).toEqual(players[2]);

      // P3 try to check and success
      response = await request(httpServer)
        .put(`/poker/${tableId}/player/${players[2]}/check`)
        .set('Accept', 'application/json');
      expect(response.body.result).toEqual(true);


      // -------------- Result ----------------- //

      // Get Next Player => P3
      response = await request(httpServer)
        .get(`/poker/${tableId}/result`)
        .set('Accept', 'application/json');
      Logger.log(`currentPlayer: ${JSON.stringify(response.body.result)}`);
    });
  });

  afterAll(async () => {
    await app.close();
  });

});
