
module.exports.id = '14.e415e43d.f10178';

const _ = require('lodash'),
  config = require('../config');

/**
 * @description flow e415e43d.f10178 update
 * @param done
 */
   

module.exports.up = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.update({'path':'e415e43d.f10178','type':'flows'}, {
    $set: {'path':'e415e43d.f10178','body':[{'id':'b68ffffb.8e49e','type':'catch','z':'e415e43d.f10178','name':'','scope':null,'x':320,'y':640,'wires':[['49075d44.432d44','2ac2f832.c11e38']]},{'id':'5c2fd91f.e496a8','type':'http response','z':'e415e43d.f10178','name':'','statusCode':'','x':777,'y':641,'wires':[]},{'id':'49075d44.432d44','type':'function','z':'e415e43d.f10178','name':'transform','func':'\nlet factories = global.get("factories"); \nlet error = msg.error.message;\ntry {\n    error = JSON.parse(error);\n}catch(e){}\n\nmsg.payload = error && error.code === 11000 ? \nfactories.messages.address.existAddress :\n\nmsg.error.message && msg.error.code ?\nmsg.error :\nfactories.messages.generic.fail;\n   \nreturn msg;','outputs':1,'noerr':0,'x':561,'y':640,'wires':[['5c2fd91f.e496a8']]},{'id':'c1ff735e.f6bd1','type':'http in','z':'e415e43d.f10178','name':'send','url':'/tx/send','method':'post','upload':false,'swaggerDoc':'','x':250,'y':280,'wires':[['a83f15e5.fc4b28']]},{'id':'a83f15e5.fc4b28','type':'async-function','z':'e415e43d.f10178','name':'','func':'const _ = global.get(\'_\');\nconst genericMessages = global.get(\'factories\').messages.generic;\nconst txMessages = global.get(\'factories\').messages.tx;\n\nconst rpc = global.get(\'rpc\');\n\n\n  if (!msg.payload.tx) {\n     throw new Error(genericMessages.notEnoughArgs);\n  }\n\n  let tx = await rpc(\'decoderawtransaction\', [msg.payload.tx]);\n\n  let voutAddresses = _.chain(tx.vout)\n    .map(vout => _.get(vout, \'scriptPubKey.addresses\', []))\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  let inputs = await Promise.mapSeries(tx.vin, async vin => {\n    let tx = await rpc(\'getrawtransaction\', [vin.txid, true]);\n    return tx.vout[vin.vout];\n  }).catch(() => Promise.reject(txMessages.wrongTx));\n\n  let vinAddresses = _.chain(inputs)\n    .map(vout => _.get(vout, \'scriptPubKey.addresses\', []))\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  let addresses = _.chain(voutAddresses)\n    .union(vinAddresses)\n    .flattenDeep()\n    .uniq()\n    .value();\n\n  tx.inputs = inputs;\n  tx.outputs = tx.vout.map(v => ({\n    value: Math.floor(v.value * Math.pow(10, 8)),\n    scriptPubKey: v.scriptPubKey,\n    addresses: v.scriptPubKey.addresses\n  }));\n\n  for (let i = 0; i < tx.inputs.length; i++) {\n    tx.inputs[i] = {\n      addresses: tx.inputs[i].scriptPubKey.addresses,\n      prev_hash: tx.vin[i].txid, //eslint-disable-line\n      script: tx.inputs[i].scriptPubKey,\n      value: Math.floor(tx.inputs[i].value * Math.pow(10, 8)),\n      output_index: tx.vin[i].vout //eslint-disable-line\n    };\n  }\n\n  tx.valueIn = _.chain(tx.inputs)\n    .map(i => i.value)\n    .sum()\n    .value();\n\n  tx.valueOut = _.chain(tx.outputs)\n    .map(i => i.value)\n    .sum()\n    .value();\n\n  tx.fee = tx.valueIn - tx.valueOut;\n  tx = _.omit(tx, [\'vin\', \'vout\', \'blockhash\']);\n\n  let hash = await rpc(\'sendrawtransaction\', [msg.payload.tx]);\n  let memTxs = await rpc(\'getrawmempool\', [true]);\n\n  tx.time = _.get(memTxs, `${hash}.time`, 0);\n  \n  msg.payload = tx;\n  return msg;\n  ','outputs':1,'noerr':12,'x':490,'y':280,'wires':[['c95e3eeb.97f9d']]},{'id':'c95e3eeb.97f9d','type':'http response','z':'e415e43d.f10178','name':'','statusCode':'','x':790,'y':280,'wires':[]},{'id':'9758d2b4.28879','type':'http in','z':'e415e43d.f10178','name':'history','url':'/tx/:addr/history','method':'get','upload':false,'swaggerDoc':'','x':230,'y':380,'wires':[['ca42ccf2.cc3ff']]},{'id':'ca42ccf2.cc3ff','type':'function','z':'e415e43d.f10178','name':'','func':'const prefix = global.get(\'settings.mongo.collectionPrefix\');\nconst _ = global.get(\'_\');\n\nmsg.address = msg.req.params.addr;\n\n\nmsg.payload ={ \n    model: `${prefix}Block`, \n    request: [{\n    $match: {\n      $or: [\n        {\'txs.inputs.address\': msg.address},\n        {\'txs.outputs.address\': msg.address}\n      ]\n    }\n  },\n\n  {\n    $project: {\n      txs: {\n        $map: {\n          input: \'$txs\',\n          as: \'txs\',\n          in: {\n            blockNumber: \'$number\',\n            blockHash: \'$hash\',\n            timestamp: {$cond: [\'$timestamp\', \'$timestamp\', Date.now()]},\n            inputs: \'$$txs.inputs\',\n            outputs: \'$$txs.outputs\',\n            hash: \'$$txs.hash\'\n          }\n        }\n      }\n    }\n  },\n  {$unwind: \'$txs\'},\n  {\n    $match: {\n      $or: [\n        {\'txs.inputs.address\': msg.address},\n        {\'txs.outputs.address\': msg.address}\n      ]\n    }\n  },\n  {$group: {_id: \'a\', txs: {$push: \'$txs\'}}},\n  {\n    $project: {\n      unconfirmed: {\n        $filter: {\n          input: "$txs",\n          as: \'tx\',\n          cond: {$eq: [\'$$tx.blockNumber\', -1]}\n        }\n      },\n      confirmed: {\n        $filter: {\n          input: "$txs",\n          as: \'tx\',\n          cond: {$gt: [\'$$tx.blockNumber\', -1]}\n        }\n      },\n\n    }\n  },\n  {\n    $project: {\n      txs: {$setUnion: [\'$unconfirmed\', \'$confirmed\']}\n    }\n  },\n  {$unwind: \'$txs\'},\n  {$sort: {\'txs.timestamp\': -1}},\n  {$skip: parseInt(msg.req.query.skip) || 0},\n  {$limit: parseInt(msg.req.query.limit) || 100},\n  {$group: {_id: \'a\', txs: {$push: \'$txs\'}}}]\n};\n\nreturn msg;','outputs':1,'noerr':0,'x':370,'y':380,'wires':[['e6aea25e.ce0d9','27a09812.82cb28']]},{'id':'e6aea25e.ce0d9','type':'mongo','z':'e415e43d.f10178','model':'','request':'{}','options':'{}','name':'mongo','mode':'1','requestType':'4','dbAlias':'primary.data','x':530,'y':380,'wires':[['bcfa0a27.cb3308']]},{'id':'86a9e0c2.636de','type':'http response','z':'e415e43d.f10178','name':'','statusCode':'','x':830,'y':380,'wires':[]},{'id':'bcfa0a27.cb3308','type':'function','z':'e415e43d.f10178','name':'','func':'const _ = global.get(\'_\');\n\n\n\nmsg.payload = _.get(msg.payload, \'0.txs\', [])\n\nreturn msg;','outputs':1,'noerr':0,'x':670,'y':380,'wires':[['86a9e0c2.636de']]},{'id':'2ac2f832.c11e38','type':'debug','z':'e415e43d.f10178','name':'','active':true,'console':'false','complete':'error','x':535,'y':587,'wires':[]},{'id':'27a09812.82cb28','type':'debug','z':'e415e43d.f10178','name':'','active':true,'console':'false','complete':'false','x':600,'y':529,'wires':[]}]}
  }, {upsert: true}, done);
};

module.exports.down = function (done) {
  let coll = this.db.collection(`${_.get(config, 'nodered.mongo.collectionPrefix', '')}noderedstorages`);
  coll.remove({'path':'e415e43d.f10178','type':'flows'}, done);
};