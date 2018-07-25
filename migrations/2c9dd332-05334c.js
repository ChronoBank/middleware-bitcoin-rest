
module.exports.id = '2c9dd332.05334c';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow 2c9dd332.05334c update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({"path":"2c9dd332.05334c","type":"flows"}, {
    $set: {"path":"2c9dd332.05334c","body":[{"id":"7c68e0a0.c140d","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"2","dbAlias":"primary.accounts","x":650,"y":620,"wires":[["54f1c0e7.3a5a7"]]},{"id":"316484c0.63001c","type":"function","z":"2c9dd332.05334c","name":"transform params","func":"const prefix = global.get('settings.mongo.accountPrefix');\n\nmsg.address = msg.payload.address;\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: [{\n       address: msg.address\n   }, {isActive: false}]\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":450,"y":620,"wires":[["7c68e0a0.c140d"]]},{"id":"468de3dc.eb162c","type":"http in","z":"2c9dd332.05334c","name":"balance","url":"/addr/:addr/balance","method":"get","upload":false,"swaggerDoc":"","x":50,"y":860,"wires":[["f3fd84f1.fb6e48"]]},{"id":"6731d0f7.68fb4","type":"function","z":"2c9dd332.05334c","name":"transform params","func":"const prefix = global.get('settings.mongo.accountPrefix');\n\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.req.params.addr\n   }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":310,"y":920,"wires":[["a66b89d5.08b868"]]},{"id":"a66b89d5.08b868","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.accounts","x":502.50000381469795,"y":921.24999904632,"wires":[["36a27ede.06cd52"]]},{"id":"36a27ede.06cd52","type":"function","z":"2c9dd332.05334c","name":"transform output","func":"\nconst _ = global.get('_');\n\nlet account = msg.payload[0];\n\n\nmsg.payload = {\n    confirmations0: {\n      satoshis: _.get(account, 'balances.confirmations0', 0),\n      amount: _.get(account, 'balances.confirmations0', 0) / 100000000\n    },\n    confirmations3: {\n      satoshis: _.get(account, 'balances.confirmations3', 0),\n      amount: _.get(account, 'balances.confirmations3', 0) / 100000000\n    },\n    confirmations6: {\n      satoshis: _.get(account, 'balances.confirmations6', 0),\n      amount: _.get(account, 'balances.confirmations6', 0) / 100000000\n    },\n  };\n\n\nreturn msg;","outputs":1,"noerr":0,"x":696.250007629395,"y":921.24999904632,"wires":[["6e227f25.b210e"]]},{"id":"6e227f25.b210e","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":931.250007629395,"y":919.99999904632,"wires":[]},{"id":"e859d127.685df","type":"catch","z":"2c9dd332.05334c","name":"","scope":["9d44ee1d.e443","468de3dc.eb162c","8346fba1.12d028","5a35929d.0a716c","5e8d6a6f.829244","d430cfb9.80173","c1a99120.e1907","3e6b7494.a8201c","57e2003e.f0e42","f0edc237.50ca1","c1017ee9.20a23","2897ae84.380082","54f1c0e7.3a5a7","f597c720.2602e8","b06bab45.8c4e48","fd565cdc.5b9e","2be633a7.9859fc","d0426981.27e8a8","4e47577b.ea57f8","e4822e75.693fd","6e227f25.b210e","cfe70bd2.1b0638","4945e333.41fc8c","a66b89d5.08b868","21088134.04adae","7c68e0a0.c140d","f0afeaab.4cf7e8","2741509c.e882c","fb8909f1.457008","65927d71.4e8c44","66707387.71cc7c","3c61534d.fb608c","c0de808e.fca52","fee41eb3.787da","d7c0637b.46c32","568b5627.690888","b224dbf1.a256c8","36a27ede.06cd52","cdd0bdcd.24b59","2a6a8ea2.44a9e2","6731d0f7.68fb4","316484c0.63001c","dd761548.26d778","a315811b.0503e","375e54b9.33dc5c"],"x":180,"y":1280,"wires":[["568b5627.690888","8618c9a.7189a38"]]},{"id":"4e47577b.ea57f8","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":1230,"y":1020,"wires":[]},{"id":"375e54b9.33dc5c","type":"http in","z":"2c9dd332.05334c","name":"utxo","url":"/addr/:addr/utxo","method":"get","upload":false,"swaggerDoc":"","x":50,"y":980,"wires":[["f87c5cd4.98ce2"]]},{"id":"352fd4a8.2620ac","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo create addr","mode":"1","requestType":"1","dbAlias":"primary.accounts","x":1010,"y":160,"wires":[["19ccb851.43dfd8"]]},{"id":"fb8909f1.457008","type":"amqp in","z":"2c9dd332.05334c","name":"post addresses","topic":"${config.rabbit.serviceName}.account.create","iotype":"3","ioname":"events","noack":"0","durablequeue":"1","durableexchange":"0","server":"","servermode":"1","x":120,"y":260,"wires":[["f0edc237.50ca1"]]},{"id":"f0edc237.50ca1","type":"function","z":"2c9dd332.05334c","name":"","func":"\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;","outputs":1,"noerr":0,"x":290,"y":260,"wires":[["56b47c8c.da26b4"]]},{"id":"d430cfb9.80173","type":"amqp out","z":"2c9dd332.05334c","name":"","topic":"${config.rabbit.serviceName}.account.created","iotype":"3","ioname":"events","server":"","servermode":"1","x":1510,"y":140,"wires":[]},{"id":"5e8d6a6f.829244","type":"amqp in","z":"2c9dd332.05334c","name":"delete addresses","topic":"${config.rabbit.serviceName}.account.delete","iotype":"3","ioname":"events","noack":"0","durablequeue":"1","durableexchange":"0","server":"","servermode":"1","x":80,"y":720,"wires":[["c1017ee9.20a23"]]},{"id":"c1017ee9.20a23","type":"function","z":"2c9dd332.05334c","name":"","func":"\nmsg.payload = JSON.parse(msg.payload);\n\nreturn msg;","outputs":1,"noerr":0,"x":250,"y":720,"wires":[["316484c0.63001c"]]},{"id":"c1a99120.e1907","type":"amqp out","z":"2c9dd332.05334c","name":"","topic":"${config.rabbit.serviceName}.account.deleted","iotype":"3","ioname":"events","server":"","servermode":"1","x":1030,"y":620,"wires":[]},{"id":"54f1c0e7.3a5a7","type":"function","z":"2c9dd332.05334c","name":"","func":"\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;","outputs":1,"noerr":0,"x":810,"y":620,"wires":[["c1a99120.e1907"]]},{"id":"b224dbf1.a256c8","type":"function","z":"2c9dd332.05334c","name":"transform","func":"const prefix = global.get('settings.mongo.accountPrefix');\nconst factories = global.get(\"factories\"); \nlet error = msg.error.message;\n\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nif(error.code !== 11000)\nthrow new Error(msg.error.message);\n\nmsg.payload = {\n    model: `${prefix}Account`, \n    request: [\n        {address: msg.payload.request.address}, \n        {$set:{ \n            isActive: true\n        }}\n        ]\n   \n};\n\nreturn msg;","outputs":1,"noerr":0,"x":920,"y":80,"wires":[["21088134.04adae"]]},{"id":"21088134.04adae","type":"mongo","z":"2c9dd332.05334c","model":"EthAccount","request":"{}","options":"","name":"mongo","mode":"1","requestType":"2","dbAlias":"primary.accounts","x":1130,"y":80,"wires":[["19ccb851.43dfd8"]]},{"id":"1f3f3c62.d10644","type":"catch","z":"2c9dd332.05334c","name":"","scope":["352fd4a8.2620ac"],"x":740,"y":80,"wires":[["b224dbf1.a256c8"]]},{"id":"cfe70bd2.1b0638","type":"http response","z":"2c9dd332.05334c","name":"","statusCode":"","x":770,"y":1260,"wires":[]},{"id":"568b5627.690888","type":"function","z":"2c9dd332.05334c","name":"transform","func":"\nlet factories = global.get(\"factories\"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\nfactories.messages.generic.fail;\n\nif (msg.statusCode == '401')\n    msg.payload = factories.messages.generic.failAuth;\n\n\nreturn msg;","outputs":1,"noerr":0,"x":380,"y":1280,"wires":[["fee41eb3.787da"]]},{"id":"fee41eb3.787da","type":"switch","z":"2c9dd332.05334c","name":"","property":"amqpMessage","propertyType":"msg","rules":[{"t":"null"},{"t":"nnull"}],"checkall":"true","outputs":2,"x":550,"y":1280,"wires":[["cfe70bd2.1b0638"],["9d44ee1d.e443","2741509c.e882c"]]},{"id":"9d44ee1d.e443","type":"async-function","z":"2c9dd332.05334c","name":"","func":"if(msg.error.message.includes('CONNECTION ERROR')){\n    await Promise.delay(5000);\n    await msg.amqpMessage.nackMsg();\n}else{\n    await msg.amqpMessage.ackMsg();\n}\n    \nmsg.payload = typeof msg.error.message;    \n    \nreturn msg;","outputs":1,"noerr":6,"x":770,"y":1320,"wires":[[]]},{"id":"2741509c.e882c","type":"debug","z":"2c9dd332.05334c","name":"","active":true,"console":"false","complete":"error","x":779.0729522705078,"y":1365.895881652832,"wires":[]},{"id":"f6068a59.a626f8","type":"function","z":"2c9dd332.05334c","name":"prepare request","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\nmsg.address = msg.req.params.addr;\n\n\nmsg.payload ={ \n    model: `${prefix}Coin`, \n    request: {\n        address: msg.address,\n        inputBlock: null\n   },\n   options: {\n      sort: {outputBlock: -1},\n      limit: parseInt(msg.req.query.limit) || 100,\n      skip: parseInt(msg.req.query.skip) || 0\n   }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":320,"y":1020,"wires":[["632e3db3.5e84a4"]]},{"id":"632e3db3.5e84a4","type":"mongo","z":"2c9dd332.05334c","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":530,"y":1020,"wires":[["47ba8bca.296834"]]},{"id":"ba1b2434.4edcd8","type":"function","z":"2c9dd332.05334c","name":"transform output","func":"const _ = global.get('_');\n\n\n\nmsg.payload = msg.coins.map(coin => {\n      return ({\n        txid: _.chain(msg.payload)\n            .find({blockNumber: coin.outputBlock, index: coin.outputTxIndex})\n            .get('_id')\n            .value(),\n        address: coin.address,\n        amount: coin.value / Math.pow(10, 8),\n        satoshis: coin.value,\n        height: coin.outputBlock,\n        vout: coin.outputIndex\n      });\n    });\n\nreturn msg;","outputs":1,"noerr":0,"x":1020,"y":1020,"wires":[["4e47577b.ea57f8"]]},{"id":"56b47c8c.da26b4","type":"function","z":"2c9dd332.05334c","name":"prepare request","func":"const genericMessages = global.get('factories').messages.generic;\n\nif (!msg.payload.address) {\n     throw new Error(genericMessages.notEnoughArgs);\n  }\n\nmsg.address = msg.payload.address;\nreturn msg;","outputs":1,"noerr":0,"x":440,"y":160,"wires":[["fb82a695.38da58"]]},{"id":"fb82a695.38da58","type":"function","z":"2c9dd332.05334c","name":"","func":"const prefix = global.get('settings.mongo.accountPrefix');\n\n\n    msg.payload = {\n    model: `${prefix}Account`, \n    request: {\n       address: msg.address\n        \n    }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":810,"y":160,"wires":[["352fd4a8.2620ac"]]},{"id":"8618c9a.7189a38","type":"debug","z":"2c9dd332.05334c","name":"","active":true,"console":"false","complete":"error","x":355.0798797607422,"y":1180.895851135254,"wires":[]},{"id":"47ba8bca.296834","type":"function","z":"2c9dd332.05334c","name":"","func":"const prefix = global.get('settings.mongo.collectionPrefix');\nconst _ = global.get('_');\n\n\nmsg.coins = msg.payload;\n\nmsg.payload ={ \n    model: `${prefix}Tx`, \n    request: {$or: \n    msg.coins.map(coin=>({\n        blockNumber: coin.outputBlock,\n        index: coin.outputTxIndex\n    }))\n    }\n};\n\nreturn msg;","outputs":1,"noerr":0,"x":670,"y":1020,"wires":[["ba1bb3ff.39969"]]},{"id":"ba1bb3ff.39969","type":"mongo","z":"2c9dd332.05334c","model":"","request":"{}","options":"{}","name":"mongo","mode":"1","requestType":"0","dbAlias":"primary.data","x":810,"y":1020,"wires":[["ba1b2434.4edcd8"]]},{"id":"98d385f9.3dc368","type":"amqp out","z":"2c9dd332.05334c","name":"internal","topic":"${config.rabbit.serviceName}_user.created","iotype":"3","ioname":"internal","server":"","servermode":"1","x":1480,"y":220,"wires":[]},{"id":"19ccb851.43dfd8","type":"function","z":"2c9dd332.05334c","name":"","func":"\nif(msg.amqpMessage)\n    msg.amqpMessage.ackMsg();\n\nmsg.payload = JSON.stringify({address: msg.address})\n\nreturn msg;","outputs":1,"noerr":0,"x":1290,"y":180,"wires":[["98d385f9.3dc368","d430cfb9.80173"]]},{"id":"d024c67e.aff178","type":"amqp in","z":"2c9dd332.05334c","name":"addr_create","topic":"address.created","iotype":"1","ioname":"profiles","noack":"0","durablequeue":"0","durableexchange":"1","server":"","servermode":"1","x":70,"y":140,"wires":[["c6c61a01.39eae8"]]},{"id":"c6c61a01.39eae8","type":"laborx_get_addr","z":"2c9dd332.05334c","addr":"","name":"laborx_get_addr","x":240,"y":160,"wires":[["56b47c8c.da26b4"]]},{"id":"44e89087.bfd5d","type":"amqp in","z":"2c9dd332.05334c","name":"addr_delete","topic":"address.deleted","iotype":"1","ioname":"profiles","noack":"0","durablequeue":"0","durableexchange":"1","server":"","servermode":"1","x":70,"y":560,"wires":[["590a7430.0837fc"]]},{"id":"590a7430.0837fc","type":"laborx_get_addr","z":"2c9dd332.05334c","addr":"","name":"laborx_get_addr","x":240,"y":580,"wires":[["316484c0.63001c"]]},{"id":"f3fd84f1.fb6e48","type":"laborx_auth","z":"2c9dd332.05334c","name":"laborx_auth","configprovider":"1","dbAlias":"accounts","providerpath":"http://localhost:3001","x":110,"y":920,"wires":[["6731d0f7.68fb4"]]},{"id":"f87c5cd4.98ce2","type":"laborx_auth","z":"2c9dd332.05334c","name":"laborx_auth","configprovider":"1","dbAlias":"accounts","providerpath":"http://localhost:3001","x":150,"y":1020,"wires":[["f6068a59.a626f8"]]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({"path":"2c9dd332.05334c","type":"flows"}, done);
};
