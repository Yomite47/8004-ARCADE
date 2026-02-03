const { PinataSDK } = require("pinata-web3");
const pinata = new PinataSDK({ pinataJwt: "test", pinataGateway: "test" });
console.log(pinata.upload);
