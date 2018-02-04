
export function fetchJSON(url, method, data = null, token = null, customHeaders = null) {
  const headers = {
    'content-type': 'application/json',
    Authorization: `Bearer ${token}`
  }

  return new Promise((resolve, reject) => {
    const settings = {
      method,
      headers: { ...headers, ...customHeaders }
    }

    if (data) settings.body = JSON.stringify(data)

    fetch(url, settings)
      .then((response) => {
        if (response.ok) {
          return response.json().then(resolve)
        }
        return reject(new Error(`Could not fetch (${method}) ${url}`))
      })
      .catch(reject)
  })
}

export function get(url, token = null, customHeaders = null) {
  return fetchJSON(url, 'get', null, token, customHeaders)
}