# EthBuildQuest_FadingHope

Fading Hope team, repo for Eth BuildQuest

To setup project
`yarn install`

Auto Compile contract
`npx hardhat watch compile`

Auto test contract
`npx hardhat watch test`

Manual compile contract. ABI file in artifacts folder
`npx run hardhat compile`

Deploy contract
`npx run hardhat deploy`

Deploy contract on localhost

`npx hardhat node` on different command line

`npx hardhat run scripts/deploy.ts --network localhost` on 2nd command line

Deploy contract on Rinkeby
`npx hardhat run scripts/deploy.ts --network rinkeby`

You need to setup `.env` file before deploy live
