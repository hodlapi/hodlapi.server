const R = require('ramda')
const { createClient } = require('redis')

// const client = createClient()
//
// client.on("error", function (err) {
//   console.log("Error " + err);
// });
//
// module.exports.HSET = R.curry((set, key, value) => new Promise((resolve) => {
//   client.hset(set, key, value, (err, val) => {
//     if (err) {
//       console.log(err)
//     }
//     resolve(val)
//   })
// }))
//
// module.exports.HGET = R.curry((set, key) => new Promise((resolve) => {
//   client.hget(set, key, (err, val) => {
//     if (err) console.log(err)
//     resolve(val)
//   })
// }))