const R = require('ramda')
const axios = require('axios')
const { ZeroXTransaction } = require('../models')

const PAGE_LIMIT = 50
const CONCURRENT_REQUESTS_AMOUNT = 5

const saveDocuments = ([{ id, ...head }, ...tail]) => {
  const transaction = new ZeroXTransaction({
    ...head,
    transactionId: id
  })
  transaction.save()
  
  if (tail.length) saveDocuments(tail)
}

const createRequest = R.curry(
  (limit, page) => axios.get(`https://api.0xtracker.com/fills?limit=${limit}&page=${page}`)
    .then(R.prop('data'))
)

const fetchPagesChunk = (r) => Promise.all(R.map(R.call, r))

const multiPageLoad = async (requests) => {
  const [head, ...tail] = requests
  const res = await fetchPagesChunk(head)
  console.log('loading pages', R.map(R.prop('page'), res))
  
  R.compose(
    saveDocuments,
    R.flatten,
    R.map(R.propOr([], 'fills')),
  )(res)
  
  if (tail.length) return multiPageLoad(tail)
}

const pageRangeLoader = (req, count) => R.compose(
  multiPageLoad,
  R.splitEvery(CONCURRENT_REQUESTS_AMOUNT),
  R.map((p) => () => req(p)),
  R.range(1),
  R.inc
)(count)

const zeroXParser = async (loadedCount) => {
  try {
    const fullPageRequest = createRequest(PAGE_LIMIT)
    const firstPage = await fullPageRequest(1)
    const { total } = firstPage
    const diff = total - loadedCount
    if (diff === 0) {
      console.log('already up do date')
      return
    }
    console.log(`${diff} documents to load`)
    const fullPages = Math.floor(diff / PAGE_LIMIT)
    const lastPageItems = diff - fullPages
    await pageRangeLoader(fullPageRequest, fullPages)
    if (lastPageItems !== 0) {
      const lastItems = await createRequest(lastPageItems)(fullPages + 1)
      R.compose(saveDocuments, R.prop('fills'))(lastItems)
    }
    return diff
  } catch (e) {
    console.log(e)
  }
  
}

module.exports = { zeroXParser }

