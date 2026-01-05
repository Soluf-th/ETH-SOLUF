 import { MetaMaskSDK } from "@metamask/sdk"

const MMSDK = new MetaMaskSDK({
  dappMetadata: {
    name: "Example JavaScript Dapp",
    url: window.location.href,
  },
  infuraAPIKey: "0c91c54ca09942718c417979dcb18a88",
})

const ethereum = MMSDK.getProvider()

// Connect to MetaMask
const accounts = await MMSDK.connect()

// Make requests
const result = await ethereum.request({ 
  method: "0x03750bCdF6A6d690051bCDA44290B10C39A7669B", 
  params: [] 
})
