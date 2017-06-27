import urlUtils from './url';

var unifiedFetch = (url, init, timeout) => {
    let isExceedOneSec = false;
    let fetchPromise = fetch(url, init)
        .then(function (response) {
            if (response.ok)
                return response.json();
            else
                return Promise.reject({ state: response.status, msg: response.statusText });
        })
        .then(function (res) {
            if (res.state === 0){
              return res.data;
            }
            else
                return Promise.reject({ state: res.state, msg: res.data });
        })
        .catch(function (err) {
            if (err.state < 1000 || err.state >= 999900) {
                //process http error & global error
                err.global = true;

                if (err.state < 1000) {
                    //http error
                    if(err.state === 11){
                      location = '/Shared/Error';
                    }
                }
                else if (err.state === 999901) {
                    location = '/login';
                }
                else if (err.state === 999902) {
                    location = '/Shared/Error';
                }
            }
            return Promise.reject(err);
        })


    let timeoutPromise = new Promise(function (resolve, reject) {
        if (timeout !== undefined)
            setTimeout(() => reject({ state: 2000 }), timeout);
    });

    //use Promise.race to process timeout
    return Promise.race([fetchPromise, timeoutPromise]);
}

/*
@url
@params
timeout: ajax timeout
method: http method
query: key=value appended to url
data: JSONed into body
*/
var entityFetch = (url, params) => {

    if (params === undefined) {
        params = url;
        url = params.url;
    }

    let init = { credentials: 'include' };
    if (params.data !== undefined) {
        init.body = JSON.stringify(params.data);
        init.method = 'POST';
        init.headers = {
            'Content-Type': 'application/json'
        }
    }
    if (params.method !== undefined) {
        init.method = params.method;
    }

    return unifiedFetch(`${url}${(() => {
        if (params.query) return `?${urlUtils.objectToQuery(params.query)}`;
        else return '';
    })()}`, init, params.timeout);
}

export default { fetch: entityFetch };

export { unifiedFetch, entityFetch };
