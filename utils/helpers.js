
const parseApiResponse = (res,result) => {
    console.log(result)
    if (Object.keys(result).includes('err')){
        res.status(400).json(result.err);
    } else {
        res.status(200).json(result);
    }
}

module.exports = {
    parseApiResponse
}