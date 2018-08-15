/**
 * Copyright 2017–2018, LaborX PTY
 * Licensed under the AGPL Version 3 license.
 * @author Egor Zuev <zyev.egor@gmail.com>
 */

require('dotenv/config');

const config = require('../config'),
  Network = require('bcoin/lib/protocol/network'),
  bcoin = require('bcoin'),
  amqp = require('amqplib'),
  Promise = require('bluebird'),
  mongoose = require('mongoose');

mongoose.Promise = Promise;
mongoose.accounts = mongoose.createConnection(config.mongo.accounts.uri);
mongoose.data = mongoose.createConnection(config.mongo.data.uri);

const ctx = {
    network: null,
    accounts: [],
    amqp: {}
  },
  expect = require('chai').expect,
  accountModel = require('../models/accountModel'),
  request = Promise.promisify(require('request')),
  scope = {};


describe('core/rest', function () {

  before(async () => {

    ctx.network = Network.get('regtest');

    let keyPair = bcoin.hd.generate(ctx.network);
    let keyPair2 = bcoin.hd.generate(ctx.network);

    ctx.accounts.push(keyPair, keyPair2);


    ctx.amqp.instance = await amqp.connect(config.rabbit.url);
    ctx.amqp.channel = await ctx.amqp.instance.createChannel();

    ctx.provider = config.nodered.functionGlobalContext.node.provider;
    await ctx.provider.setRabbitmqChannel(ctx.amqp.channel, config.rabbit.serviceName);

    mongoose.connect(config.mongo.accounts.uri, {useMongoClient: true});
  });

  after(async () => {
    await ctx.amqp.instance.close();
    return mongoose.disconnect();
  });


  it('remove registered addresses from mongodb', async () => {

    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    let keyring2 = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);

    return await accountModel.remove({
      address: {
        $in: [keyring.getAddress().toString(),
          keyring2.getAddress().toString()]
      }
    })
  });

  it('generate some coins for accountA', async () => {
    const instance = (await ctx.provider.get()).instance;

    scope.height = await instance.execute('getblockcount', []);
    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    return await instance.execute('generatetoaddress', [50, keyring.getAddress().toString()])
  });

  it('unlock coins for account A by generating some coins for accountB', async () => {
    const instance = (await ctx.provider.get()).instance;

    let keyring = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);

    await ctx.amqp.channel.assertExchange('events', 'topic', {durable: false});
    await ctx.amqp.channel.assertQueue(`app_${config.rabbit.serviceName}_test.block`);
    await ctx.amqp.channel.bindQueue(`app_${config.rabbit.serviceName}_test.block`, 'events', `${config.rabbit.serviceName}_block`);


    return await new Promise(res => {
      ctx.amqp.channel.consume(`app_${config.rabbit.serviceName}_test.block`, data => {
        let payload = JSON.parse(data.content.toString());
        if (payload.block >= scope.height + 150)
          res();
      }, {noAck: true});
      instance.execute('generatetoaddress', [100, keyring.getAddress().toString()]);
    })
  });

  it('address/create from post request', async () => {
    const account = ctx.accounts[0];
    let keyring = new bcoin.keyring(account.privateKey, ctx.network);
    const address = keyring.getAddress().toString();
    await new Promise.all([
      (async () => {
        await new Promise((res, rej) => {
          request({
            url: `http://${config.rest.domain}:${config.rest.port}/addr`,
            method: 'post',
            json: {
              address
            }
          }, async (err, resp) => {
            if (err || resp.statusCode !== 200)
              return rej(err || resp);
            const newAccount = await accountModel.findOne({address});
            expect(newAccount).not.to.be.null;
            expect(newAccount.isActive).to.be.true;
            res();
          });
        });
      })(),
      (async () => {
        await ctx.amqp.channel.assertExchange('internal', 'topic', {durable: false});
        await ctx.amqp.channel.assertQueue(`${config.rabbit.serviceName}_test.user`);
        await ctx.amqp.channel.bindQueue(`${config.rabbit.serviceName}_test.user`, 'internal',
          `${config.rabbit.serviceName}_user.created`
        );
        return await new Promise(res => ctx.amqp.channel.consume(`${config.rabbit.serviceName}_test.user`, async (message) => {
          const content = JSON.parse(message.content);
          if (content.address === address)
            res();
        }, {noAck: true}));
      })()
    ]);

  });

  it('address/create from post request[1]', async () => {
    const account = ctx.accounts[1];
    let keyring = new bcoin.keyring(account.privateKey, ctx.network);
    const address = keyring.getAddress().toString();
    request({
      url: `http://${config.rest.domain}:${config.rest.port}/addr`,
      method: 'post',
      json: {
        address
      }
    });
  });

  it('validate potential balance changes for accounts', async () => {
    await Promise.delay(5000);
    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    let keyring2 = new bcoin.keyring(ctx.accounts[1].privateKey, ctx.network);

    let responses = await Promise.all([
      keyring.getAddress().toString(),
      keyring2.getAddress().toString()
    ].map(address => {
      return request({
        url: `http://${config.rest.domain}:${config.rest.port}/addr/${address}/balance`,
        method: 'get',
        json: true
      })
    }));

    responses.forEach(resp =>
      expect(resp.body.confirmations0.satoshis).to.be.above(1)
    )
  });


  it('validate utxo history ', async () => {
    let keyring = new bcoin.keyring(ctx.accounts[0].privateKey, ctx.network);
    const address = keyring.getAddress().toString();

    let response = await request({
      url: `http://${config.rest.domain}:${config.rest.port}/addr/${address}/utxo`,
      method: 'get',
      json: true
    });

    expect(response.body).to.not.empty;
    const utxo = response.body[0];

    expect(utxo.height).to.greaterThan(-1);
    expect(utxo.address).to.equal(address);
    expect(utxo).to.contain.all.keys(['amount', 'satoshis', 'height', 'vout']);

  });
});
