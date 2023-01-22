const proxyTestUrl = `https://maimai.wahlap.com/`

async function checkProxySettingStatus() {
    return new Promise((resolve, reject) => {
        fetch(proxyTestUrl, { 'mode': 'no-cors' },)
            .then(() => resolve(false))
            .catch(() => {
                // Fetch current location's href to detect network issue
                fetch(window.location.href, {"node": "no-cors"}, )
                    .then(() => resolve(true))
                    .catch(() => resolve(false))
            })
    })
}

export {
    checkProxySettingStatus
}
