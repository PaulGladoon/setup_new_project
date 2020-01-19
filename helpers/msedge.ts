import * as fetch from 'node-fetch'

async function clearEdgeSessionIfEgists() {
  const baseEdgeUrl = 'http://18.235.129.92:8080' // need to set
  const status = await fetch(`${baseEdgeUrl}/status`).then((resp) => resp.json()).catch(console.error)
  const sessionObj = status.browsers.MicrosoftEdge['44.17763'].unknown

  if (sessionObj && sessionObj.sessions[0].id) {
    await fetch(`${baseEdgeUrl}/wd/hub/session/${sessionObj.sessions[0].id}`,
      {method: 'DELETE'}
    ).then((resp) => resp.json()).catch(console.error)
  }
}

export {clearEdgeSessionIfEgists}
