var objectToQuery = (paramObject) => {
    var res = [];
    for (var p in paramObject) {
        res.push(`${p}=${paramObject[p]}`);
    }
    return res.join('&');
}

export default { objectToQuery }