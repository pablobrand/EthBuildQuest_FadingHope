import * as XLSX from 'xlsx';
import { BigNumber } from "ethers";
import * as fs from 'fs';
interface JsonData {
    Lv: number;
    TownCost: string;
    IncomePerSec: string;
    BarrackCost: string;
    WallCost: string;
}

async function main() {
    // import file excel GameConfig.xlsx
    const workbook = XLSX.readFile('./contracts/scripts/GameConfig.xlsx');
    const sheet_name_list = workbook.SheetNames;
    // read sheet "TownCenterIncome"
    console.log(sheet_name_list[3])
    const worksheet = workbook.Sheets[sheet_name_list[3]];
    // convert to json
    const json = XLSX.utils.sheet_to_json<JsonData>(worksheet);
    
    // loop through json and convert all string to parse science number string
    for (let i = 0; i < json.length; i++) {
        json[i].TownCost = parseScientific(json[i].TownCost);
        json[i].IncomePerSec = parseScientific(json[i].IncomePerSec);
        json[i].BarrackCost = parseScientific(json[i].BarrackCost);
        json[i].WallCost = parseScientific(json[i].WallCost);
        
    }
    
    console.log(json);



    // write json to file gameconfig.json
    const file = './contracts/scripts/GameConfigBuilding.json';
    const jsonString = JSON.stringify(json, null, 2);
    fs.writeFileSync(file, jsonString);
    // read json and convert to json string 
    // const testIndex = 41;
    // console.log("lv", json[testIndex].Lv);
    // console.log("townCost", json[testIndex].TownCost);
    // console.log("incomePerSec", json[testIndex].IncomePerSec);
    // console.log("barrackCost", json[testIndex].BarrackCost);
    // console.log("wallCost", json[testIndex].WallCost);
    
    // console.log("max number", ethers.constants.MaxUint256.toString());
    // console.log("convert to string:" , parseScientific(json[46].WallCost.toString()))
    // console.log("Bignumber", BigNumber.from(json[46].WallCost.toString()).toString());
    // console.log("Bignumber", BigNumber.from(json[46].WallCost.toString()).mul(10000000).toString());


}
function parseScientific(num: string): string {
    // If the number is not in scientific notation return it as it is.
    if (!/\d+\.?\d*e[+-]*\d+/i.test(num)) {
      return num;
    }
  
    // Remove the sign.
    const numberSign = Math.sign(Number(num));
    num = Math.abs(Number(num)).toString();
  
    // Parse into coefficient and exponent.
    const [coefficient, exponent] = num.toLowerCase().split("e");
    let zeros = Math.abs(Number(exponent));
    const exponentSign = Math.sign(Number(exponent));
    const [integer, decimals] = (coefficient.indexOf(".") != -1 ? coefficient : `${coefficient}.`).split(".");
  
    if (exponentSign === -1) {
      zeros -= integer.length;
      num =
        zeros < 0
          ? integer.slice(0, zeros) + "." + integer.slice(zeros) + decimals
          : "0." + "0".repeat(zeros) + integer + decimals;
    } else {
      if (decimals) zeros -= decimals.length;
      num =
        zeros < 0
          ? integer + decimals.slice(0, zeros) + "." + decimals.slice(zeros)
          : integer + decimals + "0".repeat(zeros);
    }
  
    return numberSign < 0 ? "-" + num : num;
  }
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
