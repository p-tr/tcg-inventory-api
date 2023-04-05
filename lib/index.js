function capitalize(str) {
    let therestofthestring = str.slice(1)
    let firstletter = str.charAt(0).toUpperCase()
    return firstletter + therestofthestring
}

function disableXPoweredByHeader(apps) {
    apps.forEach((app) => {
      app.disable('x-powered-by')  
    })
}

module.exports = {
    capitalize,
    disableXPoweredByHeader
}