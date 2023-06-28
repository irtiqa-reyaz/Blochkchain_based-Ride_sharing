const hre = require("hardhat");
const fs = require('fs');
const fse = require("fs-extra");
const { verify } = require('../utils/verify')
const { developmentChains } = require('../utils/helper-scripts')
import {ethers} from "ethers" 

useEffect(()=>{
  const template=async()=>{
 
    const contractAddres="0x7f48D996399d68255240Bd72A434A1C963D401Ad";
    const contractABI=abi.abi;
    try{

      const {ethereum}=window;
      const account = await ethereum.request({
        method:"eth_requestAccounts"
      })

      window.ethereum.on("accountsChanged",()=>{
       window.location.reload()
      })
      setAccount(account);
      const provider = new ethers.providers.Web3Provider(ethereum);//read the Blockchain
      const signer =  provider.getSigner(); //write the blockchain
      
      const contract = new ethers.Contract(
        contractAddres,
        contractABI,
        signer
      )
      console.log(contract)
    setState({provider,signer,contract});
     
    }catch(error){
      console.log(error)
    }
  }
  template();
},[])
async function main() {
  const deployNetwork = hre.network.name

  const greetingText = "Hello, Hardhat!"
  const Greeter = await hre.ethers.getContractFactory("Greeter");
  const greeter = await Greeter.deploy(greetingText);

  await greeter.deployed();

  console.log("Greeter deployed to :", greeter.address);
  console.log("Network deployed to :", deployNetwork);

  /* this code writes the contract addresses to a local */
  /* file named config.js that we can use in the app */
  if (fs.existsSync("../front-end/src")) {
    fse.copySync(`./artifacts/contracts`, "../front-end/src/artifacts")
    fs.writeFileSync('../front-end/src/utils/contracts-config.js', `
    export const contractAddress = "${greeter.address}"
    export const ownerAddress = "${greeter.signer.address}"
    export const networkDeployedTo = "${hre.network.config.chainId}"
    `)
  }

  if (!developmentChains.includes(deployNetwork) && hre.config.etherscan.apiKey[deployNetwork]) {
    console.log("waiting for 6 blocks verification ...")
    await greeter.deployTransaction.wait(6)

    // args represent contract constructor arguments
    const args = [greetingText]
    await verify(greeter.address, args)
  }
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
